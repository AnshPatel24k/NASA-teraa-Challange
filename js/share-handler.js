// Social Share Handler
document.addEventListener('DOMContentLoaded', () => {
  const shareBtn = document.getElementById('share-btn');
  const shareStatus = document.getElementById('share-status');

  shareBtn.addEventListener('click', async () => {
    const shareData = {
      title: 'Terra Timelapse Detective: Shrinking Aral Sea',
      text: 'Explore how the Aral Sea lost 90% of its water over 35 years.',
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        shareStatus.textContent = 'Thanks for sharing!';
      } else {
        // Fallback: copy link to clipboard
        await navigator.clipboard.writeText(shareData.url);
        shareStatus.textContent = 'Link copied to clipboard!';
      }
    } catch (err) {
      console.error('Share failed:', err);
      shareStatus.textContent = 'Unable to share at this time.';
    }

    // Clear status after 3 seconds
    setTimeout(() => {
      shareStatus.textContent = '';
    }, 3000);
  });
});
