// ==UserScript==
// @name        GitHub News Filter
// @namespace   hckr
// @description Userscript to filter GitHub news feed using case-insensitive regular expression
// @include     https://github.com/
// @version     0.5
// @author      Jakub Młokosiewicz
// @source      https://github.com/hckr/github-news-filter
// @updateURL   https://hckr.pl/github-news-filter/GitHub_News_Filter.user.js
// @downloadURL https://hckr.pl/github-news-filter/GitHub_News_Filter.user.js
// @supportURL  https://github.com/hckr/github-news-filter/issues
// @license     MIT
// ==/UserScript==

let news = document.querySelector('.news'),
    minimum = 10;

news.style.position = 'relative';
news.insertAdjacentHTML('afterbegin', `
    <label class="sr-only" for="pattern-input">News filter</label>
    <input id="pattern-input" class="form-control" style="width: 150px; position: absolute; top: 10px; right: 20px;" placeholder="News filter">
`);

let patternInput = document.getElementById('pattern-input'),
    underMinimum = 0,
    forcedMore = false,
    inputTimeout = null;

patternInput.addEventListener('input', function() {
    clearTimeout(inputTimeout);
    setTimeout(function() {
        let notHidden = filterNews([].filter.call(news.querySelectorAll('div'),
                                                  node => node.querySelector('.body')));
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
                               node => node.querySelector && node.querySelector('.body')));
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
