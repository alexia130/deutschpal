export function speakGerman(
  text: string,
) {
  if (
    typeof window === "undefined" ||
    !("speechSynthesis" in window)
  ) {
    return;
  }

  const normalizedText =
    text.trim();

  if (!normalizedText) {
    return;
  }

  window.speechSynthesis.cancel();

  const utterance =
    new SpeechSynthesisUtterance(
      normalizedText,
    );

  utterance.lang = "de-DE";
  utterance.rate = 0.9;
  utterance.pitch = 1;

  const germanVoice =
    window.speechSynthesis
      .getVoices()
      .find((voice) =>
        voice.lang
          .toLocaleLowerCase()
          .startsWith("de"),
      );

  if (germanVoice) {
    utterance.voice =
      germanVoice;
  }

  window.speechSynthesis.speak(
    utterance,
  );
}