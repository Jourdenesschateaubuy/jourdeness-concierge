"use client";

import { useState } from "react";

const lineBaseUrl = "https://line.me/R/oaMessage/@chateau-buy/?text=";

const skinOptions = [
  {
    key: "dry",
    label: "乾燥",
    title: "Repair Collection",
    description: "為乾燥與屏障不穩的肌膚，建立溫柔而長期的修護節奏。",
    points: ["修護肌膚屏障", "改善乾燥緊繃", "提升保養穩定度"],
  },
  {
    key: "sensitive",
    label: "敏感",
    title: "Calm Collection",
    description: "為容易泛紅、敏弱與不穩定膚況，提供低刺激的照護方向。",
    points: ["舒緩敏弱", "減少不適感", "建立溫和保養習慣"],
  },
  {
    key: "dull",
    label: "暗沉",
    title: "Radiance Collection",
    description: "為膚色不均與疲憊暗沉，找回乾淨透亮的肌膚光澤。",
    points: ["改善暗沉", "提升明亮感", "調整肌膚光澤"],
  },
  {
    key: "pore",
    label: "毛孔",
    title: "Balance Collection",
    description: "為油水平衡、毛孔與粗糙膚觸，建立穩定清爽的保養節奏。",
    points: ["調理油水平衡", "細緻膚觸", "改善粗糙感"],
  },
  {
    key: "line",
    label: "細紋",
    title: "Firming Collection",
    description: "為初老細紋與彈性下降，提供更細緻的滋養與支撐。",
    points: ["淡化細紋感", "提升肌膚彈性", "加強滋養修護"],
  },
];

const journals = [
  {
    title: "換季時，肌膚為什麼容易不穩？",
    text: "當氣溫、濕度與生活作息改變時，肌膚屏障容易受到影響。這時保養應回到簡單、溫和與穩定。",
  },
  {
    title: "保養不是越多越好，而是越適合越好。",
    text: "真正有效的保養，來自了解肌膚狀態後的選擇。讓美容顧問協助您找到適合的節奏。",
  },
  {
    title: "回購前，先確認現在的肌膚需求。",
    text: "同一瓶保養品不一定適合每一個季節。回購前與顧問聊聊，能讓照護更精準。",
  },
];

export default function Home() {
  const [selectedSkin, setSelectedSkin] = useState(skinOptions[0]);

  function openLine(message: string) {
    const url = `${lineBaseUrl}${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  }

  return (
    <main>
      <section className="section hero">
        <div className="nav">
          <div className="brand-small">JOURDENESS</div>
          <button
            className="nav-button"
            onClick={() =>
              openLine("您好，\n\n我最近有肌膚問題想諮詢。")
            }
          >
            Talk With Us
          </button>
        </div>

        <div className="hero-content">
          <p className="eyebrow">Digital Skin Concierge</p>
          <h1>JOURDENESS</h1>
          <h2>Care Beyond Beauty.</h2>
          <p className="hero-text">
            每一次保養，都是一次長期的陪伴。
          </p>
          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("services")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            開始 →
          </button>
        </div>
      </section>

      <section className="section story">
        <div className="content-narrow">
          <p className="eyebrow">Our Guidance</p>
          <h2>從第一次肌膚分析，到每一次回購。</h2>
          <p>
            Jourdeness Concierge 不只是提供保養資訊，而是陪您理解肌膚狀態，
            找到更適合自己的照護方式。
          </p>
          <p>
            在這裡，您不需要急著做決定。讓美容顧問陪您慢慢確認，今天的肌膚真正需要什麼。
          </p>
        </div>
      </section>

      <section className="section services" id="services">
        <div className="section-heading">
          <p className="eyebrow">Find Your Ritual</p>
          <h2>今天需要什麼？</h2>
        </div>

        <div className="service-grid">
          <button
            className="service-card"
            onClick={() =>
              openLine("您好，\n\n我想回購之前使用的產品。")
            }
          >
            <span>01</span>
            <h3>我要回購</h3>
            <p>讓美容顧問協助您確認適合延續的保養品項。</p>
          </button>

          <button
            className="service-card"
            onClick={() =>
              openLine("您好，\n\n請推薦適合我的保養方式。")
            }
          >
            <span>02</span>
            <h3>推薦保養</h3>
            <p>依照膚況、季節與生活狀態，找到適合的照護節奏。</p>
          </button>

          <button
            className="service-card"
            onClick={() =>
              document
                .getElementById("journal")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <span>03</span>
            <h3>保養知識</h3>
            <p>閱讀保養觀念、使用技巧與季節照護提醒。</p>
          </button>

          <button
            className="service-card"
            onClick={() =>
              openLine("您好，\n\n我最近有肌膚問題想諮詢。")
            }
          >
            <span>04</span>
            <h3>聯繫美容顧問</h3>
            <p>不確定如何選擇時，讓專業顧問先了解您的需求。</p>
          </button>
        </div>
      </section>

      <section className="section skin">
        <div className="section-heading">
          <p className="eyebrow">Beauty Prescription</p>
          <h2>今天困擾的是？</h2>
        </div>

        <div className="skin-options">
          {skinOptions.map((item) => (
            <button
              key={item.key}
              className={
                selectedSkin.key === item.key
                  ? "skin-button active"
                  : "skin-button"
              }
              onClick={() => setSelectedSkin(item)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="collection-card">
          <div>
            <p className="eyebrow">Care Collection</p>
            <h2>{selectedSkin.title}</h2>
            <p>{selectedSkin.description}</p>

            <ul>
              {selectedSkin.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <button
              className="primary-button"
              onClick={() =>
                openLine(
                  `您好，\n\n我想了解 ${selectedSkin.label} 適合的保養方式。`
                )
              }
            >
              和美容顧問聊聊
            </button>
          </div>

          <div className="collection-visual">
            <div className="product-bottle"></div>
          </div>
        </div>
      </section>

      <section className="section product">
        <div className="product-layout">
          <div className="product-image">
            <div className="product-bottle large"></div>
          </div>

          <div className="product-copy">
            <p className="eyebrow">Continue Your Care</p>
            <h2>專屬保養建議，從了解肌膚開始。</h2>
            <p>
              每一項 Care Collection 都不是為了快速選購，而是協助您理解：
              目前的肌膚需要修護、穩定、明亮，還是更細緻的長期照護。
            </p>

            <div className="product-info">
              <div>
                <h3>適合對象</h3>
                <p>想確認目前膚況、回購前需要建議、或希望調整保養節奏的顧客。</p>
              </div>

              <div>
                <h3>使用方式</h3>
                <p>依美容顧問建議，搭配日常清潔、調理、修護與防護步驟。</p>
              </div>

              <div>
                <h3>美容師建議</h3>
                <p>不要只依照過去使用經驗回購，建議先確認近期肌膚狀態。</p>
              </div>
            </div>

            <button
              className="secondary-button"
              onClick={() =>
                openLine("您好，\n\n我想請美容顧問幫我確認適合的保養品。")
              }
            >
              Talk With Us
            </button>
          </div>
        </div>
      </section>

      <section className="section journal" id="journal">
        <div className="section-heading">
          <p className="eyebrow">Journal</p>
          <h2>保養，是理解肌膚的過程。</h2>
        </div>

        <div className="journal-grid">
          {journals.map((journal) => (
            <article className="journal-card" key={journal.title}>
              <h3>{journal.title}</h3>
              <p>{journal.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section final-cta">
        <p className="eyebrow">Talk With Us</p>
        <h2>讓美容顧問陪您找到下一步。</h2>
        <p>
          不需要立刻決定，也不需要自己猜。傳一則訊息，讓我們從您的肌膚狀態開始了解。
        </p>

        <button
          className="primary-button"
          onClick={() =>
            openLine("您好，\n\n我最近有肌膚問題想諮詢。")
          }
        >
          開啟 LINE 諮詢
        </button>
      </section>
    </main>
  );
}