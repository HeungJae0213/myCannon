// Toss AdMob API 타입 선언
interface LoadAppsInTossAdMobOptions {
  adUnitId: string;
  adType: 'interstitial' | 'rewarded';
  testMode?: boolean;
  onClose?: (result: { completed: boolean }) => void;
}

declare global {
  interface Window {
    loadAppsInTossAdMob?: (options: LoadAppsInTossAdMobOptions) => void;
    saveBase64Data?: (options: {
      base64Data: string;
      fileName: string;
      mimeType: string;
      onSuccess?: () => void;
      onError?: () => void;
    }) => void;
  }
}

export {};
