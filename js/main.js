(function () {
	const isAppleDevice = /Mac|iPhone|iPad|iPod/.test(navigator.platform) || 
						  (/Mac/.test(navigator.userAgent) && 'ontouchend' in document);
  
	if (isAppleDevice) {
	  document.documentElement.classList.add('apple-device');
	}
})();