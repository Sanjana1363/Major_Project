import { Audio } from 'expo-av';

let recording: Audio.Recording | null = null;

const startScreamDetection = async () => {
  if (isListening) return;

  try {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

    recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    await recording.startAsync();
    setIsListening(true);
    setAlertTriggered(false);

    screamInterval = setInterval(async () => {
      if (!recording) return;
      const uri = recording.getURI();
      // TODO: Read PCM from file uri and do FFT analysis here
      // This part will require additional library for reading PCM from file
    }, 300);

  } catch (err) {
    console.error("Scream detection error:", err);
  }
};

const stopScreamDetection = async () => {
  if (screamInterval) clearInterval(screamInterval);
  if (recording) {
    await recording.stopAndUnloadAsync();
    recording = null;
  }
  setIsListening(false);
  setAlertTriggered(false);
};
