
if (typeof tutorial3_manual === 'undefined') {
    class tutorial3_manual {
        constructor () {
            this.answer_input = $("#tutorial-answer-input");
            this.answer = $("#tutorial-answer");
        }
    }

    const tutorial3 = new tutorial3_manual();

    tutorial3.answer_input.on('input', (e) => {
        const answer = e.target.value;
        const answerList = answer.split(',').map(str => str.trim()).filter(Boolean);
        const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));

        const combinedList = answerList.concat(zeroSpaceList);
        const combinedSet = new Set(combinedList);

        tutorial3.answer.text(Array.from(combinedSet).join(','));
    });
};