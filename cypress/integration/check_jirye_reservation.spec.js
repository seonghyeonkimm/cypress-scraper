const findEmptyRoom = (year, month) => {
  cy.visit('http://www.jirye.com/Book/booklist.php', {
    method: 'POST',
    body: {
      Syear: year,
      Smonth: month,
    },
  });

  cy.get('span[title="예약가능"]').should($elements => {
    const data = $elements.map((i, el) => {
      const date = el.parentNode.parentNode.querySelector('h1').textContent.trim();
      const name = el.parentNode.textContent;
      const matched = /^예 \d\. (.+)/.exec(name);
      if (matched) {
        return `(${year}년 ${month}월 ${date.padStart(2, '0')}일) ${matched[1]}`;
      }
  
      return null;
    }).filter(Boolean).get();
    
    console.log('🚀 ~ data', data);
    return data;
  });
}

describe('example to-do app', () => {
  it('check 2021-10', () => {
    findEmptyRoom(2021, 10);
  });

  it('check 2021-11', () => {
    findEmptyRoom(2021, 11);
  });

  it('check 2021-12', () => {
    findEmptyRoom(2021, 12);
  });
})
