// ========== 炫酷特效 JS ==========

// 1. 粒子背景
(function() {
  if (typeof particlesJS !== 'undefined') {
    particlesJS('particles-js', {
      particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: ['#8b5cf6', '#ec4899', '#f59e0b'] },
        shape: { type: 'circle' },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        move: {
          enable: true,
          speed: 2,
          direction: 'none',
          random: true,
          out_mode: 'out'
        }
      },
      interactivity: {
        events: {
          onhover: { enable: true, mode: 'repulse' },
          onclick: { enable: true, mode: 'push' }
        }
      }
    });
  }
})();

// 2. 鼠标跟随光标
const cursor = document.createElement('div');
cursor.className = 'cursor-glow';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX - 10 + 'px';
  cursor.style.top = e.clientY - 10 + 'px';
});

// 3. 滚动进度条
const progressBar = document.createElement('div');
progressBar.className = 'scroll-progress';
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrollTop = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  const progress = (scrollTop / scrollHeight) * 100;
  progressBar.style.width = progress + '%';
});

// 4. 元素进入视口动画
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('animate-in');
    }
  });
}, observerOptions);

document.querySelectorAll('.card-hover, .glass-card, .article-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'all 0.6s ease';
  observer.observe(el);
});

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
  .animate-in {
    opacity: 1 !important;
    transform: translateY(0) !important;
  }
`;
document.head.appendChild(style);

// 5. 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 6. 复制按钮增强
document.querySelectorAll('pre').forEach(pre => {
  const btn = document.createElement('button');
  btn.className = 'btn-glow';
  btn.style.cssText = 'position:absolute;top:10px;right:10px;font-size:12px;padding:5px 10px;';
  btn.textContent = 'Copy';
  btn.onclick = () => {
    navigator.clipboard.writeText(pre.querySelector('code').innerText);
    btn.textContent = 'OK';
    setTimeout(() => btn.textContent = 'Copy', 2000);
  };
  pre.style.position = 'relative';
  pre.appendChild(btn);
});

console.log('Cool effects loaded!');
