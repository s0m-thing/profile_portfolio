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

document.addEventListener('DOMContentLoaded', () => {
	const worksSection = document.querySelector('.works-section');
	const worksList = document.querySelector('.works-list');
	const workCards = document.querySelectorAll('.work-card');
	const workNavLinks = document.querySelectorAll('.works-nav a');

	if (!worksSection || !worksList || workCards.length === 0 || workNavLinks.length === 0) return;

	const sectionStyle = getComputedStyle(worksSection);
	const cardStyle = getComputedStyle(workCards[0]);

	const WORK_TOP = parseFloat(sectionStyle.getPropertyValue('--work-top')) || 120;
	const CARD_HEIGHT = workCards[0].offsetHeight;
	const CARD_GAP = parseFloat(cardStyle.marginBottom) || 260;
	const CARD_STEP = CARD_HEIGHT + CARD_GAP;

	let isClickScrolling = false;

	function getWorksListY() {
		return window.scrollY + worksList.getBoundingClientRect().top;
	}

	function getTargetY(index) {
		return getWorksListY() + (CARD_STEP * index) - WORK_TOP;
	}

	function setActiveNav(activeIndex) {
		workNavLinks.forEach((link, index) => {
			link.classList.toggle('active', index === activeIndex);
		});
	}

	function updateWorkNav() {
		const sectionRect = worksSection.getBoundingClientRect();

		const isWorksVisible =
			sectionRect.top <= WORK_TOP + 20 &&
			sectionRect.bottom > WORK_TOP + CARD_HEIGHT;

		worksSection.classList.toggle('is-nav-show', isWorksVisible);

		if (!isWorksVisible) return;

		const worksListY = getWorksListY();
		const scrollPoint = window.scrollY + WORK_TOP + 2;

		let currentIndex = Math.floor((scrollPoint - worksListY) / CARD_STEP);

		if (currentIndex < 0) currentIndex = 0;
		if (currentIndex >= workCards.length) currentIndex = workCards.length - 1;

		setActiveNav(currentIndex);
	}

	workNavLinks.forEach((link, index) => {
		link.addEventListener('click', (e) => {
			e.preventDefault();

			const targetY = getTargetY(index);

			setActiveNav(index);
			isClickScrolling = true;

			window.scrollTo({
				top: targetY,
				behavior: 'smooth'
			});

			setTimeout(() => {
				isClickScrolling = false;
				updateWorkNav();
			}, 700);
		});
	});

	window.addEventListener('scroll', () => {
		if (!isClickScrolling) {
			updateWorkNav();
		}
	});

	window.addEventListener('load', updateWorkNav);
	window.addEventListener('resize', updateWorkNav);

	updateWorkNav();
});