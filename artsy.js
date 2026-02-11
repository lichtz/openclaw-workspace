// ========== 赛博艺术 JS ==========

// 1. 鼠标涟漪效果
(function() {
  const container = document.createElement('div');
  container.className = 'ripple-effect';
  document.body.appendChild(container);
  
  document.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'ripple';
    ripple.style.left = e.clientX + 'px';
    ripple.style.top = e.clientY + 'px';
    container.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  });
})();

// 2. 滚动触发的3D透视效果
(function() {
  const cards = document.querySelectorAll('.perspective-card');
  
  window.addEventListener('scroll', () => {
    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (inView) {
        const rotation = ((rect.top - window.innerHeight/2) / 50);
        const inner = card.querySelector('.perspective-card-inner');
        if (inner) {
          inner.style.transform = `rotateY(${rotation}deg) rotateX(${Math.abs(rotation/2)}deg)`;
        }
      }
    });
  });
})();

// 3. 动态文字悬停效果
(function() {
  const gapTexts = document.querySelectorAll('.gap-text');
  
  gapTexts.forEach(container => {
    const chars = container.textContent.split('');
    container.innerHTML = chars.map((char, i) => 
      `<span style="transition-delay: ${i * 0.05}s">${char}</span>`
    ).join('');
  });
})();

// 4. 滚动进度条 - 渐变颜色变化
(function() {
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 4px;
    background: linear-gradient(90deg, #8b5cf6, #ec4899, #f59e0b, #8b5cf6);
    background-size: 300% 100%;
    z-index: 10000;
    transition: width 0.1s ease;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', () => {
    const scrollTop = document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const progress = (scrollTop / scrollHeight) * 100;
    progressBar.style.width = progress + '%';
    progressBar.style.backgroundPosition = `${progress}% 0`;
  });
})();

// 5. 视差滚动
(function() {
  const layers = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    layers.forEach(layer => {
      const speed = parseFloat(layer.dataset.parallax) || 0.5;
      layer.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
})();

// 6. 打字机效果增强
(function() {
  const typeElements = document.querySelectorAll('[data-type]');
  
  typeElements.forEach(el => {
    const text = el.dataset.type;
    let i = 0;
    
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 100 + Math.random() * 100);
      }
    }
    type();
  });
})();

// 7. 卡片悬浮交互
(function() {
  const cards = document.querySelectorAll('.glass-card, .article-card');
  
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;
      
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      card.style.boxShadow = `${-rotateY * 2}px ${rotateX * 2}px 30px rgba(139, 92, 246, 0.3)`;
    });
    
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      card.style.boxShadow = '';
    });
  });
})();

// 8. 数字滚动动画
(function() {
  const counters = document.querySelectorAll('[data-count]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count);
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
          current += step;
          if (current >= target) {
            el.textContent = target + '+';
            clearInterval(timer);
          } else {
            el.textContent = Math.floor(current);
          }
        }, 16);
        
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(counter => observer.observe(counter));
})();

// 9. 页面加载完成动画
(function() {
  document.body.style.opacity = '0';
  
  window.addEventListener('load', () => {
    document.body.style.transition = 'opacity 0.5s ease';
    document.body.style.opacity = '1';
    
    // 元素入场动画
    document.querySelectorAll('.card-hover, .glass-card, .article-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(50px)';
      el.style.transition = 'all 0.6s ease';
      el.style.transitionDelay = `${i * 0.1}s`;
      
      setTimeout(() => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
      }, 500 + i * 100);
    });
  });
})();

// 10. 实时时间显示
(function() {
  const timeEl = document.createElement('div');
  timeEl.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    font-size: 14px;
    color: rgba(255,255,255,0.5);
    font-family: monospace;
    z-index: 10000;
  `;
  document.body.appendChild(timeEl);
  
  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleString('zh-CN', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    requestAnimationFrame(updateTime);
  }
  updateTime();
})();

// 11. 快捷键提示
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // 按ESC显示快捷键提示
    const hint = document.createElement('div');
    hint.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(139, 92, 246, 0.9);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 14px;
      z-index: 10000;
      animation: fadeInOut 3s forwards;
    `;
    hint.textContent = '🎨 艺术模式已激活 | 💫 尽情探索';
    document.body.appendChild(hint);
    setTimeout(() => hint.remove(), 3000);
  }
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeInOut {
    0% { opacity: 0; transform: translate(-50%, 10px); }
    20% { opacity: 1; transform: translate(-50%, 0); }
    80% { opacity: 1; transform: translate(-50%, 0); }
    100% { opacity: 0; transform: translate(-50%, -10px); }
  }
`;
document.head.appendChild(style);

console.log('🎨 赛博艺术效果已加载！');
