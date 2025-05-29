import correctSound from '../assets/sounds/correct.wav';
import incorrectSound from '../assets/sounds/incorrect.wav';

class SoundManager {
  private isMuted: boolean = false;
  private correctSound: HTMLAudioElement;
  private incorrectSound: HTMLAudioElement;

  constructor() {
    console.log('Initializing SoundManager...', { correctSound, incorrectSound });
    this.correctSound = new Audio(correctSound);
    this.incorrectSound = new Audio(incorrectSound);

    // Add error handlers
    this.correctSound.onerror = (e) => {
      console.error('Error loading correct sound:', e);
    };
    this.incorrectSound.onerror = (e) => {
      console.error('Error loading incorrect sound:', e);
    };

    // Add load handlers
    this.correctSound.onloadeddata = () => {
      console.log('Correct sound loaded successfully');
    };
    this.incorrectSound.onloadeddata = () => {
      console.log('Incorrect sound loaded successfully');
    };

    // Preload sounds
    this.correctSound.load();
    this.incorrectSound.load();
  }

  async playCorrect() {
    if (!this.isMuted) {
      try {
        console.log('Playing correct sound...');
        this.correctSound.currentTime = 0;
        const playPromise = this.correctSound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing correct sound:', error);
          });
        }
      } catch (error) {
        console.error('Error in playCorrect:', error);
      }
    }
  }

  async playIncorrect() {
    if (!this.isMuted) {
      try {
        console.log('Playing incorrect sound...');
        this.incorrectSound.currentTime = 0;
        const playPromise = this.incorrectSound.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error('Error playing incorrect sound:', error);
          });
        }
      } catch (error) {
        console.error('Error in playIncorrect:', error);
      }
    }
  }

  setMuted(muted: boolean) {
    console.log('Setting muted:', muted);
    this.isMuted = muted;
  }

  toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    console.log('Toggled mute:', this.isMuted);
    return this.isMuted;
  }
}

export const soundManager = new SoundManager(); 