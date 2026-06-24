// 로딩 퍼센트
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


// 카드겹침
document.addEventListener('DOMContentLoaded', () => {
	const worksSection = document.querySelector('.works-section');
	const worksList = document.querySelector('.works-list');
	const workCards = document.querySelectorAll('.work-card');
	const workNavLinks = document.querySelectorAll('.works-nav a');

	if (!worksSection || !worksList || workCards.length === 0 || workNavLinks.length === 0) return;

	let scrollAnimationId = null;
	let ticking = false;

	function getNumber(value, fallback = 0) {
		const number = parseFloat(value);
		return Number.isNaN(number) ? fallback : number;
	}

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function getWorkTop() {
		return getNumber(getComputedStyle(workCards[0]).top, 120);
	}

	function getWorksListY() {
		return window.scrollY + worksList.getBoundingClientRect().top;
	}

	function getCardY(index) {
		return getWorksListY() + workCards[index].offsetTop;
	}

	function getTargetY(index) {
		return getCardY(index) - getWorkTop();
	}

	function setActiveNav(activeIndex) {
		workNavLinks.forEach((link, index) => {
			link.classList.toggle('active', index === activeIndex);
		});
	}

	function updateCardOpacity() {
		workCards.forEach((card, index) => {
			const nextCard = workCards[index + 1];

			/* 마지막 카드는 동생이 없으니까 항상 선명하게 */
			if (!nextCard) {
				card.style.setProperty('--card-opacity', 1);
				return;
			}

			const cardRect = card.getBoundingClientRect();
			const nextRect = nextCard.getBoundingClientRect();
			const cardHeight = cardRect.height;

			/*
				동생 카드가 형 카드를 얼마나 덮었는지 계산
				0 = 안 겹침
				0.5 = 절반 겹침
				1 = 완전히 겹침
			*/
			const overlap = cardRect.bottom - nextRect.top;
			const overlapRatio = clamp(overlap / cardHeight, 0, 1);

			let opacity = 1;

			/*
				절반 이상 겹친 순간부터 형 카드 opacity 감소
				절반 겹침: opacity 1
				완전히 겹침: opacity 0
			*/
			opacity = 1 - overlapRatio * 1.3;

			card.style.setProperty('--card-opacity', clamp(opacity, 0, 1));
		});
	}

	function getCurrentIndexByOverlap() {
		let currentIndex = 0;

		workCards.forEach((card, index) => {
			if (index === 0) return;

			const prevCard = workCards[index - 1];
			const prevRect = prevCard.getBoundingClientRect();
			const currentRect = card.getBoundingClientRect();

			const overlap = prevRect.bottom - currentRect.top;
			const overlapRatio = clamp(overlap / prevRect.height, 0, 1);

			/*
				동생이 형을 절반 이상 가렸을 때부터
				동생을 현재 카드로 인식
			*/
			if (overlapRatio >= 0.5) {
				currentIndex = index;
			}
		});

		return currentIndex;
	}

	function updateWorkNav() {
		const workTop = getWorkTop();
		const scrollPoint = window.scrollY + workTop + 2;

		const sectionRect = worksSection.getBoundingClientRect();
		const firstCardY = getCardY(0);

		const currentIndex = getCurrentIndexByOverlap();
		const lastIndex = workCards.length - 1;

		/*
			nav 노출 조건
			1. 첫 카드가 sticky 위치에 도착했을 때부터
			2. works-section 안에 있을 때
			3. 마지막 카드가 현재 카드가 되면 nav 숨김
		*/
		const isNavShow =
			scrollPoint >= firstCardY &&
			sectionRect.bottom > window.innerHeight &&
			currentIndex < lastIndex;

		worksSection.classList.toggle('is-nav-show', isNavShow);

		updateCardOpacity();

		if (!isNavShow) return;

		setActiveNav(currentIndex);
	}

	function requestUpdateWorkNav() {
		if (ticking) return;

		ticking = true;

		requestAnimationFrame(() => {
			updateWorkNav();
			ticking = false;
		});
	}

	function easeInOutCubic(t) {
		return t < 0.5
			? 4 * t * t * t
			: 1 - Math.pow(-2 * t + 2, 3) / 2;
	}

	function smoothScrollTo(targetY, duration = 900) {
		if (scrollAnimationId) {
			cancelAnimationFrame(scrollAnimationId);
		}

		const startY = window.scrollY;
		const distance = targetY - startY;
		const startTime = performance.now();

		function scrollStep(currentTime) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);
			const easedProgress = easeInOutCubic(progress);

			window.scrollTo(0, startY + distance * easedProgress);
			updateWorkNav();

			if (progress < 1) {
				scrollAnimationId = requestAnimationFrame(scrollStep);
			} else {
				scrollAnimationId = null;
				updateWorkNav();
			}
		}

		scrollAnimationId = requestAnimationFrame(scrollStep);
	}

	workNavLinks.forEach((link, index) => {
		link.addEventListener('click', (e) => {
			e.preventDefault();

			const targetY = getTargetY(index);

			setActiveNav(index);
			worksSection.classList.add('is-nav-show');

			smoothScrollTo(targetY, 900);
		});
	});

	window.addEventListener('scroll', requestUpdateWorkNav);
	window.addEventListener('load', updateWorkNav);
	window.addEventListener('resize', updateWorkNav);

	updateWorkNav();
});


// 스크롤
document.addEventListener('DOMContentLoaded', () => {
	const lenis = new Lenis({
		duration: 1.15,
		easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
		smoothWheel: true,
		wheelMultiplier: 0.85,
		touchMultiplier: 1.2,
		infinite: false
	});

	function raf(time) {
		lenis.raf(time);
		requestAnimationFrame(raf);
	}

	requestAnimationFrame(raf);

	/* a 태그 클릭 시 부드럽게 이동 */
	const anchorLinks = document.querySelectorAll('a[href^="#"]');

	anchorLinks.forEach((link) => {
		link.addEventListener('click', (e) => {
			const targetId = link.getAttribute('href');

			if (!targetId || targetId === '#') return;

			const target = document.querySelector(targetId);

			if (!target) return;

			e.preventDefault();

			lenis.scrollTo(target, {
				offset: 0,
				duration: 1.1
			});
		});
	});
});

document.addEventListener('DOMContentLoaded', () => {
	const intro = document.querySelector('.intro');

	document.documentElement.classList.add('scroll-lock');
	document.body.classList.add('scroll-lock');

	intro.addEventListener('animationend', (e) => {
		if (e.animationName !== 'introOut') return;

		document.documentElement.classList.remove('scroll-lock');
		document.body.classList.remove('scroll-lock');
	});
});