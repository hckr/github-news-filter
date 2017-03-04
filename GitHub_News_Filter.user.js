// ==UserScript==
// @name        GitHub News Filter
// @namespace   hckr
// @description Userscript to filter GitHub news feed using case-insensitive regular expression
// @include     https://github.com/
// @version     0.1
// @author      Jakub Młokosiewicz
// @source      https://github.com/hckr/github-news-filter
// @license     MIT
// ==/UserScript==

let news = document.querySelector('.news'),
    minimum = 10;

news.style.position = 'relative';
news.insertAdjacentHTML('afterbegin', `
    <label style="position: absolute; top: 5px; right: 20px; font-weight: normal">
        News filter: <input id="pattern-input" style="width: 150px; border: none; border-bottom: 1px solid #aaa">
    </label>
`);

let patternInput = document.getElementById('pattern-input'),
    underMinimum = 0;
    forcedMore = false,
    inputTimeout = null;

patternInput.addEventListener('keydown', function() {
    clearTimeout(inputTimeout);
    setTimeout(function() {
        let notHidden = filterNews(news.querySelectorAll('.alert'));
        if (notHidden < minimum) {
            underMinimum = minimum - notHidden;
            forcedMore = true;
            clickMoreIfExists();
        }
    }, 1000);
});

let observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes) {
            if (!forcedMore) {
                underMinimum = minimum;
            }
            let notHidden = filterNews(
                [].filter.call(mutation.addedNodes,
                    node => node.className && node.className.match(/alert/)));
            underMinimum -= notHidden;
            if (notHidden == 0 || underMinimum > 0) {
                forcedMore = true;
                clickMoreIfExists();
            }
        }
    });
});
observer.observe(news, { childList: true });

function filterNews(newsItems) {
    let regexp = new RegExp(patternInput.value, 'i'),
        notHidden = 0;
    newsItems.forEach(el => {
        if (el.innerText.match(regexp)) {
            el.style.removeProperty('display');
            notHidden += 1;
        } else {
            el.style.display = 'none';
        }
    });

    return notHidden;
}

function clickMoreIfExists() {
    let moreButton = document.querySelector('.ajax-pagination-btn');
    if (moreButton) {
        moreButton.click();
    }
}
