// VoiceAssistantPage.js - Page Object Model for the Voice Assistant page
class VoiceAssistantPage {
  get micButton() { return $('button[data-testid="mic"]'); }
  get transcript() { return $('#transcript'); }

  async open() {
    await browser.url('/voiceassistant');
  }

  async clickMic() {
    await this.micButton.click();
  }

  async getTranscriptText() {
    return await this.transcript.getText();
  }
}
module.exports = new VoiceAssistantPage();
