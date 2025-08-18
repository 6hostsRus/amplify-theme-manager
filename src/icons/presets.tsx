import type { IconMap } from './manager';
import { makePathIcon } from './manager';

export function minimal(): IconMap {
  return {
    'alert': makePathIcon('M12 2L2 22h20L12 2z M12 16a1 1 0 110 2 1 1 0 010-2zm-1-7h2v5h-2z', 'AlertTriangle'),
    'rating.full': makePathIcon('M12 17.27L18.18 21 16.54 13.97 22 9.24 14.81 8.63 12 2 9.19 8.63 2 9.24 7.46 13.97 5.82 21 12 17.27', 'StarFull'),
    'rating.empty': makePathIcon('M22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21 16.54 13.97 22 9.24z', 'StarOutline'),
    'password.show': makePathIcon('M12 5c-7 0-11 7-11 7s4 7 11 7 11-7 11-7-4-7-11-7zm0 11a4 4 0 110-8 4 4 0 010 8z', 'Eye'),
    'password.hide': makePathIcon('M2 5l20 14M12 5c-7 0-11 7-11 7s1.34 2.35 3.66 4.26M22 12s-4-7-10-7', 'EyeOff'),
    'storage.folder': makePathIcon('M10 4l2 2h8v12H4V4z', 'Folder'),
    'storage.file': makePathIcon('M6 2h9l5 5v13H6z M14 2v6h6', 'File'),
  };
}

export async function feather(): Promise<IconMap> {
  try {
    const fi = await import('react-icons/fi');
    const map: IconMap = {
      'alert': fi.FiAlertTriangle,
      'rating.full': fi.FiStar,
      'rating.empty': fi.FiStar,
      'password.show': fi.FiEye,
      'password.hide': fi.FiEyeOff,
      'storage.folder': fi.FiFolder,
      'storage.file': fi.FiFile,
    };
    return map;
  } catch {
    return minimal();
  }
}

export type IconPresetName = 'minimal' | 'feather';
export async function buildPreset(name: IconPresetName): Promise<IconMap> {
  if (name === 'feather') return feather();
  return minimal();
}
