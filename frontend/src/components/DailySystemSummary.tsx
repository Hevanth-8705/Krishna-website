import { useState, useEffect, useRef } from 'react';
import { Calendar, Database, CheckCircle2, Cloud, Sun, CloudRain, CloudSnow, CloudLightning, Loader2, MapPin, GripVertical, Search, Mic, Square } from 'lucide-react';
import { useSystemStore } from '../store/system';

interface WeatherData {
  temp: number | null;
  condition: string;
  city: string;
  loading: boolean;
  error: boolean;
}

export function DailySystemSummary() {
  const [time, setTime] = useState(new Date());
  const [weather, setWeather] = useState<WeatherData>({
    temp: null,
    condition: '',
    city: '',
    loading: true,
    error: false,
  });

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setWeather(prev => ({ ...prev, loading: true, error: false }));
        // Try to fetch location from IP
        const locRes = await fetch('https://ipapi.co/json/');
        const locData = await locRes.json();
        const lat = locData.latitude || 40.7128;
        const lon = locData.longitude || -74.0060;
        const cityName = locData.city || 'New York';

        // Fetch weather from open-meteo
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code`);
        const weatherData = await weatherRes.json();
        const temp = weatherData.current.temperature_2m;
        const code = weatherData.current.weather_code;

        let condition = 'Clear';
        if (code >= 1 && code <= 3) condition = 'Partly Cloudy';
        if (code >= 45 && code <= 48) condition = 'Foggy';
        if (code >= 51 && code <= 67) condition = 'Rain';
        if (code >= 71 && code <= 77) condition = 'Snow';
        if (code >= 80 && code <= 82) condition = 'Showers';
        if (code >= 95) condition = 'Thunderstorm';

        setWeather({
          temp,
          condition,
          city: cityName,
          loading: false,
          error: false,
        });
      } catch (err) {
        console.error("Failed to fetch weather", err);
        setWeather(prev => ({ ...prev, loading: false, error: true }));
      }
    };

    fetchWeather();
  }, []);

  const { tasks, setTasks, setVoiceLogs } = useSystemStore();
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          stream.getTracks().forEach(t => t.stop());
          
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Data = reader.result?.toString().split(',')[1];
            if (!base64Data) return;

            setIsTranscribing(true);
            try {
              const response = await fetch('/api/transcribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  audioBase64: base64Data,
                  mimeType: 'audio/webm'
                })
              });
              const data = await response.json();
              if (data.text) {
                setTasks(prev => [{
                  id: Date.now(),
                  text: data.text.trim(),
                  status: 'pending',
                  urgency: 'medium',
                  tag: 'Voice Note'
                }, ...prev]);
              }
            } catch (error) {
              console.error('Failed to transcribe:', error);
            } finally {
              setIsTranscribing(false);
            }
          };
        };

        mediaRecorder.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Error accessing microphone:', err);
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.text.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = activeTag ? task.tag === activeTag : true;
    return matchesSearch && matchesTag;
  });

  const allTags = Array.from(new Set(tasks.map(t => t.tag).filter(Boolean)));

  const formattedTime = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'Clear': return <Sun size={20} className="text-yellow-400" />;
      case 'Partly Cloudy': 
      case 'Foggy': return <Cloud size={20} className="text-gray-400" />;
      case 'Rain': 
      case 'Showers': return <CloudRain size={20} className="text-blue-400" />;
      case 'Snow': return <CloudSnow size={20} className="text-white" />;
      case 'Thunderstorm': return <CloudLightning size={20} className="text-purple-400" />;
      default: return <Sun size={20} className="text-yellow-400" />;
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetId: number) => {
    e.preventDefault();
    if (draggedTaskId === null || draggedTaskId === targetId) return;
    
    const sourceIndex = tasks.findIndex(t => t.id === draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id === targetId);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      const newTasks = [...tasks];
      const [removed] = newTasks.splice(sourceIndex, 1);
      newTasks.splice(targetIndex, 0, removed);
      setTasks(newTasks);
    }
    setDraggedTaskId(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch(urgency) {
      case 'high': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      case 'low': return 'text-green-400 border-green-500/30 bg-green-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  return (
    <div className="glass-panel p-6 relative overflow-hidden group border border-white/5">
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#A78BFA]/5 blur-3xl rounded-full"></div>
      
      <div className="flex flex-col md:flex-row gap-6 relative z-10 w-full justify-between items-center md:items-start">
        <div className="flex-1 space-y-4 w-full flex flex-col md:flex-row justify-between items-start">
          <div className="mb-4 md:mb-0">
             <h2 className="text-[10px] font-mono tracking-widest text-[#A78BFA] uppercase mb-2 flex items-center gap-2">
               <Calendar size={12} /> Daily System Summary
             </h2>
             <div className="text-3xl font-bold font-sans tracking-tight text-white mb-1">
               {formattedTime}
             </div>
             <div className="text-sm text-gray-400 font-mono">
               {formattedDate}
             </div>
          </div>
          
          <div className="bg-black/30 w-full md:w-auto px-4 py-3 rounded-lg border border-white/5 flex items-center gap-4">
            {weather.loading ? (
              <div className="flex items-center gap-2 text-sm text-gray-400 font-mono">
                <Loader2 size={16} className="animate-spin" /> Fetching telemetry...
              </div>
            ) : weather.error ? (
              <div className="text-xs text-red-400 font-mono">Telemetry unavailable</div>
            ) : (
              <>
                <div className="flex items-center justify-center bg-black/50 p-2 rounded-full ring-1 ring-white/10">
                  {getWeatherIcon(weather.condition)}
                </div>
                <div>
                  <div className="text-xl font-bold text-white flex items-center gap-2 font-sans tracking-tight">
                    {weather.temp}°C
                  </div>
                  <div className="text-[10px] uppercase font-mono text-gray-400 flex items-center gap-1">
                    <MapPin size={10} /> {weather.city} • {weather.condition}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="w-full md:w-1/2 pt-4 md:pt-0 md:pl-6 md:border-l border-white/5 flex flex-col justify-center">
             <div className="flex items-center justify-between mb-3">
               <div className="text-[10px] font-mono tracking-wider text-gray-400 uppercase flex items-center gap-1.5">
                 <Database size={12} className="text-[#00E5FF]" /> Pending Memory Vault Tasks
               </div>
               <span className="text-[10px] font-mono text-gray-500">{filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}</span>
             </div>
             {allTags.length > 0 && (
               <div className="flex flex-wrap gap-2 mb-3">
                 <button
                   onClick={() => setActiveTag(null)}
                   className={`text-[9px] font-mono uppercase px-2 py-1 rounded-full border transition-all ${
                     activeTag === null 
                       ? 'bg-[#00E5FF]/20 border-[#00E5FF]/50 text-[#00E5FF]' 
                       : 'bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                   }`}
                 >
                   All
                 </button>
                 {allTags.map(tag => (
                   <button
                     key={tag}
                     onClick={() => setActiveTag(tag)}
                     className={`text-[9px] font-mono uppercase px-2 py-1 rounded-full border transition-all ${
                       activeTag === tag 
                         ? 'bg-[#A78BFA]/20 border-[#A78BFA]/50 text-[#A78BFA]' 
                         : 'bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-white/30'
                     }`}
                   >
                     {tag}
                   </button>
                 ))}
               </div>
             )}
             <div className="flex items-center gap-2 mb-3">
               <div className="relative flex-1">
                 <input 
                   type="text" 
                   placeholder="Search tasks..." 
                   value={searchQuery}
                   onChange={e => setSearchQuery(e.target.value)}
                   className="w-full bg-black/30 border border-white/10 rounded-lg p-2 pl-7 text-xs text-white focus:outline-none focus:border-[#00E5FF]/50 transition-colors placeholder:text-gray-600"
                 />
                 <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
               </div>
               <button
                 onClick={toggleRecording}
                 disabled={isTranscribing}
                 className={`p-2 rounded-lg border transition-all ${isRecording ? 'bg-red-500/20 border-red-500/50 text-red-500 animate-pulse' : 'bg-black/30 border-white/10 text-gray-400 hover:text-white hover:border-[#00E5FF]/50'}`}
                 title={isRecording ? "Stop Recording" : "Record Voice Note"}
               >
                 {isTranscribing ? <Loader2 size={16} className="animate-spin" /> : isRecording ? <Square size={16} /> : <Mic size={16} />}
               </button>
             </div>
             <div className="space-y-2.5">
                {filteredTasks.map((task) => (
                  <div 
                    key={task.id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, task.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:bg-white/5 transition-all cursor-grab active:cursor-grabbing ${draggedTaskId === task.id ? 'opacity-50 border-dashed border-gray-500' : ''}`}
                  >
                    <GripVertical size={14} className="text-gray-600 cursor-grab active:cursor-grabbing hover:text-white" />
                    <CheckCircle2 
                      size={14} 
                      className={task.status === 'completed' ? "text-[#00FF9D]" : "text-gray-600"} 
                    />
                    <span className={`text-xs font-sans leading-tight flex-1 ${task.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-300'}`}>
                      {task.text}
                    </span>
                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getUrgencyColor(task.urgency)}`}>
                      {task.urgency}
                    </span>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/5 text-gray-400 border border-white/10">
                      {task.tag}
                    </span>
                  </div>
                ))}
             </div>
        </div>
      </div>
    </div>
  );
}
