const tutorial_answer_input = document.getElementById("tutorial-answer-input");
const tutorial_answer = document.getElementById("tutorial-answer");

tutorial_answer_input.addEventListener('input', (e) => {
    const answer = e.target.value;
    const answerList = answer.split(',').map(str => str.trim()).filter(Boolean);
    const zeroSpaceList = answerList.map(str => str.replace(/\s+/g, ''));

    const combinedList = answerList.concat(zeroSpaceList);
    const combinedSet = new Set(combinedList);

    tutorial_answer.textContent = Array.from(combinedSet).join(',');
})