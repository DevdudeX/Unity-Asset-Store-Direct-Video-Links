// ==UserScript==
// @name         Unity Asset Store: Direct YouTube Links
// @namespace    UnityAssetStoreDirectLinks
// @version      1.0
// @description  Add direct YouTube links under showcase video thumbnails
// @author       DevdudeX
// @match        https://assetstore.unity.com/*
// @grant        none
// ==/UserScript==

(function ()
{
    'use strict';

    const interval = setInterval(() =>
    {
        const thumbs = document.querySelectorAll('div[class*="youtube"]');
        if (!thumbs.length) return;

        const scripts = document.querySelectorAll('script[type="text/javascript"][nonce]');
        if (!scripts.length) return;

        clearInterval(interval);

        const thumbToVideo = new Map();

        // Build thumbnail to video url map
        for (const s of scripts)
        {
            const text = s.textContent;
            if (!text || !text.includes('"type":"youtube"')) continue;

            let pos = 0;
            while (true)
            {
                const typeIdx = text.indexOf('"type":"youtube"', pos);
                if (typeIdx === -1) break;

                const imgKey = '"imageUrl":"';
                const imgStart = text.indexOf(imgKey, typeIdx);
                if (imgStart === -1) break;

                const imgValueStart = imgStart + imgKey.length;
                const imgEnd = text.indexOf('"', imgValueStart);
                const embedUrl = text.substring(imgValueStart, imgEnd).replace(/\\\//g, '/');

                const thumbKey = '"thumbnailUrl":"';
                const thumbStart = text.indexOf(thumbKey, imgEnd);
                if (thumbStart === -1) break;

                const thumbValueStart = thumbStart + thumbKey.length;
                const thumbEnd = text.indexOf('"', thumbValueStart);
                const thumbUrl = text.substring(thumbValueStart, thumbEnd);

                const thumbFile = thumbUrl.split('/').pop();
                const videoId = embedUrl.split('/embed/')[1]?.split('?')[0];

                if (thumbFile && videoId)
                {
                    thumbToVideo.set(thumbFile, `https://www.youtube.com/watch?v=${videoId}`);
                }

                pos = thumbEnd;
            }
        }

        // Inject links
        thumbs.forEach(thumb =>
        {
            if (thumb.querySelector('.tm-direct-link')) return;

            const bg = thumb.style.backgroundImage;
            if (!bg) return;

            const thumbFile = bg.split('/').pop()?.split(')')[0]?.replace(/"/g, '');

            if (!thumbFile) return;

            const videoUrl = thumbToVideo.get(thumbFile);
            if (!videoUrl) return;

            const container = document.createElement('div');
            container.className = 'tm-direct-link';

            container.style.position = 'absolute';
            container.style.bottom = '0';
            container.style.left = '0';
            container.style.right = '0';
            container.style.background = 'rgba(255,255,255,0.55)';
            container.style.textAlign = 'center';
            container.style.fontSize = '11px';
            container.style.padding = '0px';
            container.style.zIndex = '9999';
            container.style.borderTop = '1px solid black';

            // Add hyperlink
            const link = document.createElement('a');
            link.href = videoUrl;
            link.textContent = 'Direct Link';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';

            link.style.color = '#000';
            link.style.textDecoration = 'underline';
            link.style.cursor = 'pointer';

            container.appendChild(link);

            thumb.style.position = 'relative';
            thumb.appendChild(container);
        });
    }, 300);
})();
