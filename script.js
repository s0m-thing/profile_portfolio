document.addEventListener('DOMContentLoaded', () => {
    const percentText = document.querySelector('.loading-percent');

    if (!percentText) {
        console.error('loading-percent 요소를 찾을 수 없습니다.');
        return;
    }

    let percent = 0;

    setTimeout(() => {
        const loading = setInterval(() => {
            percent += 1;
            percentText.textContent = `${percent}%`;

            if (percent >= 100) {
                clearInterval(loading);
            }
        }, 18);
    }, 2550);
});