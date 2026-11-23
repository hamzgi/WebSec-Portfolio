import WhaleScene from "./whale-scene";

const projectSamples = [
  {
    title: "Project name / 01",
    kind: "WEB SECURITY",
    description: "프로젝트의 문제, 맡은 역할, 그리고 보안 관점의 해결 과정을 적는 자리입니다.",
    stack: ["Next.js", "Security", "Docker"],
    tint: "blue",
  },
  {
    title: "Project name / 02",
    kind: "CLOUD NATIVE",
    description: "GitHub 레포지토리와 연결될 카드입니다. 핵심 기술과 짧은 설명을 자동으로 불러오도록 확장할 수 있습니다.",
    stack: ["Kubernetes", "CI/CD", "DevOps"],
    tint: "aqua",
  },
  {
    title: "Project name / 03",
    kind: "RESEARCH NOTE",
    description: "CTF, 보안 연구, 학습 기록처럼 문제 해결 방식을 보여주는 아카이브 카드입니다.",
    stack: ["OWASP", "CTF", "Write-up"],
    tint: "coral",
  },
];

const timeline = [
  ["20XX", "NAVY", "해군 복무 경험을 한 줄로 정리합니다."],
  ["20XX", "LEARNING", "보안·개발 공부를 시작한 계기와 집중한 분야를 적습니다."],
  ["20XX", "BUILDING", "팀 프로젝트, 동아리, 공모전 등 주요 활동을 기록합니다."],
  ["NOW", "DIVING DEEPER", "현재 탐구 중인 보안과 클라우드 네이티브 관심사를 보여줍니다."],
];

function Compass() {
  return (
    <svg viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="29" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="m36 12 6 24-6 24-6-24z" fill="currentColor" />
      <path d="m12 36 24 6 24-6-24-6z" fill="currentColor" opacity=".24" />
      <circle cx="36" cy="36" r="3" fill="var(--seafoam)" />
    </svg>
  );
}

function DepthMark() {
  return <span className="depth-mark" aria-hidden="true"><i /><i /><i /></span>;
}

export default function Home() {
  return (
    <main id="top">
      <section className="hero" aria-labelledby="hero-title">
        <header className="topbar">
          <a className="wordmark" href="#top" aria-label="첫 화면으로 이동">
            <DepthMark />
            <span>YOUR NAME</span>
          </a>
          <nav aria-label="주요 메뉴">
            <a href="#projects">Projects</a>
            <a href="#about">About</a>
            <a href="#journey">Journey</a>
          </nav>
          <a className="contact-button" href="#contact">CONTACT</a>
        </header>

        <div className="hero-layout">
          <div className="hero-copy">
            <p className="kicker"><span /> NAVY VETERAN · WEB SECURITY · CLOUD NATIVE</p>
            <h1 id="hero-title">DEEP<br /><em>DIVE.</em></h1>
            <p className="hero-intro">
              깊이 있게 문제를 탐구하고, 흔들리지 않는 시스템을 만듭니다.<br />
              보안과 클라우드를 항해하는 개발자 포트폴리오.
            </p>
            <a className="solid-button" href="#projects">PORTFOLIO EXPEDITION</a>
          </div>

          <div className="hero-model" aria-label="마우스를 따라 움직이는 3D 고래 모델">
            <WhaleScene />
            <p className="model-hint">MOVE YOUR CURSOR<br />TO GUIDE THE WHALE</p>
            <div className="model-label label-top">SPECIMEN / 001</div>
            <div className="model-label label-bottom">OCEAN SYSTEMS<br />ONLINE</div>
          </div>

          <aside className="hero-aside" aria-label="포트폴리오 요약">
            <div className="aside-unit compass-unit"><Compass /><span>N 37°<br />E 127°</span></div>
            <div className="aside-unit"><strong>01</strong><span>WEB<br />SECURITY</span></div>
            <div className="aside-unit"><strong>02</strong><span>CONTAINER<br />SYSTEMS</span></div>
            <div className="aside-unit"><strong>03</strong><span>CONTINUOUS<br />LEARNING</span></div>
          </aside>
        </div>

        <div className="hero-foot">
          <p>Built for the open web.<br />Designed with depth.</p>
          <p className="scroll-cue">SCROLL TO EXPLORE <span>↓</span></p>
          <p>SEOUL, KR<br />2026</p>
        </div>
      </section>

      <section className="marquee" aria-label="핵심 관심 분야">
        <div className="marquee-track">
          <span>SECURE BY DESIGN</span><b>✦</b><span>CONTAINERIZED THINKING</span><b>✦</b><span>EXPLORE THE DEPTHS</span><b>✦</b>
          <span>SECURE BY DESIGN</span><b>✦</b><span>CONTAINERIZED THINKING</span><b>✦</b><span>EXPLORE THE DEPTHS</span><b>✦</b>
        </div>
      </section>

      <section className="projects section-grid" id="projects" aria-labelledby="projects-title">
        <div className="section-index">01 / SELECTED PROJECTS</div>
        <div className="section-title-block">
          <p className="kicker"><span /> REPOSITORY LOG</p>
          <h2 id="projects-title">WHAT I&apos;VE<br /><em>BUILT.</em></h2>
        </div>
        <p className="section-lead">실제 구현물과 문제 해결의 과정을 모아두는 곳입니다. 추후 GitHub API를 연결하면 최신 레포지토리 정보를 이 영역에 표시할 수 있습니다.</p>

        <div className="project-grid">
          {projectSamples.map((project, index) => (
            <article className={`project-card ${project.tint}`} key={project.title}>
              <div className="card-top"><span>{project.kind}</span><span>0{index + 1}</span></div>
              <div className="project-visual" aria-hidden="true">
                <div className="repo-window">
                  <div><i /><i /><i /></div>
                  <code>{index === 1 ? "kubectl get pods" : "git status --secure"}</code>
                  <span>{index === 1 ? "READY   3/3" : "SYSTEMS NOMINAL"}</span>
                </div>
                <div className="buoy" />
              </div>
              <div className="card-copy">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <ul aria-label="기술 스택">{project.stack.map((tag) => <li key={tag}>{tag}</li>)}</ul>
              </div>
              <a href="#contact" className="case-link">CASE STUDY <span>+</span></a>
            </article>
          ))}
        </div>
      </section>

      <section className="about section-grid" id="about" aria-labelledby="about-title">
        <div className="section-index">02 / ABOUT THE DEVELOPER</div>
        <div className="about-art" aria-hidden="true">
          <div className="depth-rings"><i /><i /><i /><i /></div>
          <p>KEEP<br />EXPLORING</p>
        </div>
        <div className="about-content">
          <p className="kicker"><span /> PROFILE</p>
          <h2 id="about-title">CALM AT<br /><em>THE CORE.</em></h2>
          <p className="about-copy">해군에서 배운 책임감과 침착함을 바탕으로, 복잡한 시스템을 차분하게 분석합니다. 웹 보안의 기본을 단단히 쌓고 컨테이너 환경에서 더 안전하게 운영되는 서비스를 탐구합니다.</p>
          <div className="profile-columns">
            <div><h3>STACK</h3><p>JavaScript · Next.js · Docker<br />Kubernetes · Git · Linux</p></div>
            <div><h3>INTERESTS</h3><p>Web Security · Cloud Native<br />Infrastructure · CTF</p></div>
            <div><h3>CERTIFICATES</h3><p>취득 자격증을<br />여기에 추가하세요.</p></div>
          </div>
        </div>
      </section>

      <section className="journey" id="journey" aria-labelledby="journey-title">
        <div className="journey-heading">
          <div><p className="kicker"><span /> SHIP&apos;S LOG</p><h2 id="journey-title">THE <em>JOURNEY.</em></h2></div>
          <p>지나온 활동이 다음 탐험의 좌표가 됩니다.</p>
        </div>
        <ol className="timeline">
          {timeline.map(([date, title, description]) => (
            <li key={date + title}>
              <div className="timeline-dot" />
              <time>{date}</time>
              <h3>{title}</h3>
              <p>{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="contact" id="contact" aria-labelledby="contact-title">
        <div className="contact-orbit" aria-hidden="true"><span>LET&apos;S BUILD · LET&apos;S LEARN · LET&apos;S EXPLORE · </span></div>
        <p className="kicker"><span /> SEND A SIGNAL</p>
        <h2 id="contact-title">LET&apos;S MAKE<br />WAVES <em>TOGETHER.</em></h2>
        <p className="contact-copy">협업, 프로젝트, 또는 좋은 대화를 기다리고 있습니다.</p>
        <div className="contact-links">
          <a href="mailto:hello@example.com">EMAIL <span>hello@example.com</span></a>
          <a href="https://github.com/" target="_blank" rel="noreferrer">GITHUB <span>github.com/your-id</span></a>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LINKEDIN <span>linkedin.com/in/your-id</span></a>
        </div>
      </section>

      <footer>
        <a className="wordmark" href="#top"><DepthMark /><span>YOUR NAME</span></a>
        <span>© 2026 · MADE WITH CURIOSITY</span>
        <a href="#top">BACK TO SURFACE ↑</a>
      </footer>
    </main>
  );
}
