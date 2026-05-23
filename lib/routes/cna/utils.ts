import { load } from 'cheerio';

import got from '@/utils/got';

export async function getFullText(item) {
    if (item.link.startsWith('https://www.youtube.com/')) {
        return item;
    }

    const detailResponse = await got({
        method: 'get',
        url: item.link,
    });
    const content = load(detailResponse.data);
    content('div.SubscriptionInner').remove();
    content('.gmailNews').remove();

    // Those boxes are for explaining terms. They are injected inline and interrupt reading.
    // If readers want to learn about terms, they can learn more online.
    content('.dictionary-box').remove();
    // Those are for separating "延伸閱讀" links. On web pages, those links have style "display:block;".
    // However, some RSS readers, such as TT-RSS, sanitize HTML aggressively and remove <style> tags and style= attributes.
    // As a result, a wrapping div is needed.
    content('.moreArticle-link').wrap('<div></div>');

    const topImage = content('.fullPic').html();

    item.description = (topImage === null ? '' : topImage) + content('.paragraph').eq(0).html();
    item.category = [
        ...content("meta[property='article:tag']")
            .toArray()
            .map((e) => e.attribs.content),
        content('.active > a').text(),
    ];

    return item;
}
