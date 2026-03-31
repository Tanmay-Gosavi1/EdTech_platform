export const getYoutubeVideoId = (urlOrId = '') => {
  const input = String(urlOrId).trim();

  if (!input) {
    return '';
  }

  // Allow raw 11-char video IDs as input.
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const parsedUrl = new URL(input);
    const host = parsedUrl.hostname.replace('www.', '').toLowerCase();

    if (host === 'youtu.be') {
      return parsedUrl.pathname.split('/').filter(Boolean)[0] || '';
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsedUrl.pathname === '/watch') {
        return parsedUrl.searchParams.get('v') || '';
      }

      if (parsedUrl.pathname.startsWith('/embed/')) {
        return parsedUrl.pathname.split('/embed/')[1]?.split('/')[0] || '';
      }

      if (parsedUrl.pathname.startsWith('/shorts/')) {
        return parsedUrl.pathname.split('/shorts/')[1]?.split('/')[0] || '';
      }

      if (parsedUrl.pathname.startsWith('/live/')) {
        return parsedUrl.pathname.split('/live/')[1]?.split('/')[0] || '';
      }
    }

    return '';
  } catch {
    return '';
  }
};