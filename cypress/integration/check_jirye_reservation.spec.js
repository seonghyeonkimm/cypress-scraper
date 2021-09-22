const sendSlack = (blocks) => {
  cy.request(
    'POST',
    Cypress.env('SLACK_WEBHOOK_URL'),
    {
      blocks: [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": ":mag: *지례예술촌* 예약 점검 (<http://www.jirye.com/Book/booklist.php|예약하기>)"
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
  let messageBlocks = [];
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
          return `*(${year}년 ${month}월 ${date.padStart(2, '0')}일)* ${matched[1]}`;
        }

        return null;
      }).filter(Boolean).get();

      if (data.length === 0) {
        messageBlocks = messageBlocks.concat(createMessageBlock({
          year,
          month,
          message: '예약 가능한 날짜가 없습니다.',
        }));
        return;
      }

      messageBlocks = messageBlocks.concat(createMessageBlock({
        year,
        month,
        message: data.join('\n'),
      }));
    });
  }

  after(() => {
    sendSlack(messageBlocks);
  });

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
