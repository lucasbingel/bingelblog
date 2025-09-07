'use client'

import { Article } from "../../lib/articles";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

interface Props {
  data: Article[];
}




export default function ArticleTable({ data }: Props) {
  const router = useRouter();
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };


  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white shadow rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">ID</th>
            <th className="px-4 py-2">Tag</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Description</th>
            <th className="px-4 py-2">Creator</th>
            <th className="px-4 py-2">Last Update</th>
            <th className="px-4 py-2">Views</th>
            <th className="px-4 py-2">Fav</th>
          </tr>
        </thead>
        <tbody>
          {data.map(article => (
            <tr
              key={article.id}
              className="hover:bg-gray-100 cursor-pointer"
              onDoubleClick={() => router.push(`/wiki/${article.id}`)}
            >
              <td className="border px-4 py-2">{article.id}</td>
              <td className="border px-4 py-2">{article.tag}</td>
              <td className="border px-4 py-2">{article.category}</td>
              <td className="border px-4 py-2">{article.name}</td>
              <td className="border px-4 py-2">{article.description}</td>
              <td className="border px-4 py-2">{article.creator}</td>
              <td className="border px-4 py-2">{article.lastUpdate}</td>
              <td className="border px-4 py-2">{article.views}</td>
              <td className="border px-4 py-2">
                <button className="cursor-pointer" onClick={() => toggleFavorite(article.id)}>
                  {favorites.includes(article.id) ? "★" : "☆"}
                </button>
            </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
