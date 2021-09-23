const sendSlack = ({
  blocks,
  shouldMention,
}) => {
  cy.request(
    'POST',
    Cypress.env('SLACK_WEBHOOK_URL'),
    {
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": `:mag: *지례예술촌* 예약 점검 (<http://www.jirye.com/Book/booklist.php|예약하기>) ${shouldMention ? '<@U01J6NZDH5X>' : ''}`
          }
        },
        {
          "type": "divider"
        },
        ...blocks,
      ],
    }
  );
};

const createMessageBlock = ({
  year,
  month,
  message,
}) => {
  return [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `*[${year}년 ${month}월]*`,
      }
    },
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": message,
      }
    },
  ]
}


describe('Check Jirye Reservation', () => {
  let shouldMention;
  let blocks = [];
  const changeDate = (year, month) => {
    cy.get('[name="Syear"]').select(year.toString());
    cy.get('[name="Smonth"]').select(month.toString());
    cy.get('.search').click();
  };

  const findEmptyRoom = (year, month) => {
    cy.get('span[title="예약가능"]').should($elements => {
      const data = $elements.map((i, el) => {
        const date = el.parentNode.parentNode.querySelector('h1').textContent.trim();
        const name = el.parentNode.textContent;
        const matched = /^예 \d\. (.+)/.exec(name);
        if (matched) {
          return `*(${year}년 ${month}월 ${date.padStart(2, '0')}일)* ${matched[1]}`;
        }

        return null;
      }).filter(Boolean).get();

      if (data.length === 0) {
        blocks = blocks.concat(createMessageBlock({
          year,
          month,
          message: '예약 가능한 날짜가 없습니다.',
        }));
        return;
      }

      if (year === 2021 && month === 11) {
        shouldMention = true;
      }

      blocks = blocks.concat(createMessageBlock({
        year,
        month,
        message: data.join('\n'),
      }));
    });
  };

  before(() => {
    cy.visit('http://www.jirye.com/Book');
  })

  after(() => {
    sendSlack({
      blocks,
      shouldMention,
    });
  });

  it('check reservation', () => {
    changeDate(2021, 10);
    findEmptyRoom(2021, 10);

    changeDate(2021, 11);
    findEmptyRoom(2021, 11);

    changeDate(2021, 12);
    findEmptyRoom(2021, 12);
  });
})
