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
	const workNavLinks = document.querySelectorAll('.works-nav a');

	if (!worksSection || !worksList || workNavLinks.length === 0) return;

	const navItems = Array.from(workNavLinks)
		.map((link) => {
			const targetId = link.getAttribute('href');
			const card = targetId ? document.querySelector(targetId) : null;

			return {
				link,
				card
			};
		})
		.filter((item) => item.card);

	const workCards = navItems.map((item) => item.card);

	if (workCards.length === 0) return;

	let ticking = false;
	let scrollAnimationId = null;

	let workTop = 0;
	let worksListY = 0;
	let workStep = 800;
	let targetYs = [];

	function getNumber(value, fallback = 0) {
		const number = parseFloat(value);
		return Number.isNaN(number) ? fallback : number;
	}

	function clamp(value, min, max) {
		return Math.min(Math.max(value, min), max);
	}

	function refreshMeasurements() {
		const worksStyle = getComputedStyle(worksSection);
		const firstCardStyle = getComputedStyle(workCards[0]);

		workTop = getNumber(firstCardStyle.top, 120);
		worksListY = window.scrollY + worksList.getBoundingClientRect().top;

		const cssViewHeight = getNumber(worksStyle.getPropertyValue('--work-view-height'), 0);
		const fallbackStep =
			workCards[0].offsetHeight + getNumber(firstCardStyle.marginBottom, 0);

		workStep = cssViewHeight || fallbackStep || 800;

		/*
			중요:
			sticky 상태의 offsetTop을 다시 읽지 않고,
			카드 한 장당 고정 간격으로 목표 위치 계산
		*/
		targetYs = workCards.map((_, index) => {
			return worksListY + workStep * index - workTop;
		});
	}

	function getTargetY(index) {
		refreshMeasurements();

		return targetYs[index] ?? window.scrollY;
	}

	function getCurrentIndex() {
		refreshMeasurements();

		const firstTargetY = targetYs[0];
		const lastIndex = workCards.length - 1;

		const rawIndex = Math.round((window.scrollY - firstTargetY) / workStep);

		return clamp(rawIndex, 0, lastIndex);
	}

	function setActiveNav(activeIndex) {
		navItems.forEach((item, index) => {
			item.link.classList.toggle('active', index === activeIndex);
		});
	}

	function updateCardOpacity() {
		workCards.forEach((card, index) => {
			const nextCard = workCards[index + 1];

			if (!nextCard) {
				card.style.setProperty('--card-opacity', 1);
				return;
			}

			const cardRect = card.getBoundingClientRect();
			const nextRect = nextCard.getBoundingClientRect();
			const cardHeight = cardRect.height;

			const overlap = cardRect.bottom - nextRect.top;
			const overlapRatio = clamp(overlap / cardHeight, 0, 1);

			const opacity = 1 - overlapRatio * 1.3;

			card.style.setProperty('--card-opacity', clamp(opacity, 0, 1));
		});
	}

	function updateWorkNav() {
		refreshMeasurements();

		const currentIndex = getCurrentIndex();
		const lastIndex = workCards.length - 1;

		const sectionRect = worksSection.getBoundingClientRect();

		const isNavShow =
			window.scrollY >= targetYs[0] - 2 &&
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

	function smoothScrollTo(targetY, duration = 850) {
		if (scrollAnimationId) {
			cancelAnimationFrame(scrollAnimationId);
		}

		const html = document.documentElement;
		const originalScrollBehavior = html.style.scrollBehavior;

		/*
			중요:
			CSS의 scroll-behavior: smooth랑 JS 스크롤이 겹치면
			위로 이동할 때 버벅이고 목표 위치로 못 감
		*/
		html.style.scrollBehavior = 'auto';

		const startY = window.scrollY;
		const endY = Math.max(0, targetY);
		const distance = endY - startY;
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
				window.scrollTo(0, endY);

				html.style.scrollBehavior = originalScrollBehavior;
				scrollAnimationId = null;

				updateWorkNav();
			}
		}

		scrollAnimationId = requestAnimationFrame(scrollStep);
	}

	navItems.forEach((item, index) => {
		item.link.addEventListener(
			'click',
			(e) => {
				e.preventDefault();
				e.stopImmediatePropagation();

				const targetY = getTargetY(index);

				setActiveNav(index);
				worksSection.classList.add('is-nav-show');

				smoothScrollTo(targetY, 850);
			},
			true
		);
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