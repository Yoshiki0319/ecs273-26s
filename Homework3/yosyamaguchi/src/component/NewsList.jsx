import * as d3 from "d3";
import { useEffect, useState } from "react";

export function NewsList({ selectedStock }) {
  const [news, setNews] = useState([]);
  const [openKey, setOpenKey] = useState(null);

  useEffect(() => {
    async function loadNews() {
      const index = await d3.csv("/data/news-index.csv", d3.autoType);
      const items = await Promise.all(
        index
          .filter((d) => d.ticker === selectedStock)
          .map(async (d) =>
            parseNews(
              d.file,
              await d3.text(`/data/stocknews/${selectedStock}/${d.file}`)
            )
          )
      );

      setNews(items);
      setOpenKey(null);
    }

    loadNews();
  }, [selectedStock]);

  return (
    <div className="h-full overflow-y-auto p-2">
      {news.map((item) => {
        const key = `${item.date}-${item.title}`;
        return (
          <button
            key={key}
            type="button"
            className="mb-2 w-full border-b border-gray-200 pb-2 text-left"
            onClick={() => setOpenKey(openKey === key ? null : key)}
          >
            <div className="text-sm font-semibold text-black">{item.title}</div>
            <div className="text-xs text-gray-500">{item.date}</div>
            {openKey === key && (
              <div className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
                {item.body}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function parseNews(path, content) {
  const titleMatch = content.match(/^Title:\s*(.+)$/m);
  const dateMatch = content.match(/^Date:\s*(.+)$/m);

  return {
    title: titleMatch?.[1] || titleFromPath(path),
    date: dateMatch?.[1] || dateFromPath(path),
    body: content,
  };
}

function titleFromPath(path) {
  return path
    .split("/")
    .pop()
    .replace(".txt", "")
    .replace(/^\d{4}-\d{2}-\d{2} \d{2}-\d{2}_/, "");
}

function dateFromPath(path) {
  return path.split("/").pop().slice(0, 16).replace(/-(\d{2})$/, ":$1");
}
