import { ReactNode } from "react";

// lib/articles.ts  (Ausschnitt)
export type ArticleBlock = {
  language: string;
  id: string;
  type:
    | "heading"
  | "text"
  | "code"
  | "list"
  | "image"
  | "quote"
  | "video"
  | "divider"
  | "table"
  | "section"
  | "collapsible"
  | "alert";
  content: string;
};

export type Article = {
  category: ReactNode;
  description: ReactNode;
  lastUpdate: ReactNode;
  tag: ReactNode;
  id: string;
  name: string;
  content: string; // JSON-String von ArticleBlock[]
  creator: string;
  views: number;
};

let articles: Record<string, Article> = {
  R70A21: {
    id: "R70A21",
    name: "Video Artikel",
    creator: "Admin",
    views: 123,
    content: JSON.stringify([
      { id: "1", type: "heading", content: "Hallo Welt" },
      { id: "2", type: "text", content: "Dies ist ein Beispielartikel." },
      { id: "3", type: "code", content: "console.log('Hallo Welt');" },
      { id: "4", type: "quote", content: "Dies ist ein Zitat." },
      { id: "5", type: "divider", content: "" },
      { id: "6", type: "video", content: "https://www.youtube.com/watch?v=HEfUVf0nn8g" }
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: undefined
  },
  R70A22: {
    id: "R70A22",
    name: "Leerer Artikel",
    creator: "Admin",
    views: 12311,
    content: JSON.stringify([
      
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: "Design"
  },
    R70A23: {
    id: "R70A23",
    name: "driiter Artikel",
    creator: "Admin",
    views: 123,
    content: JSON.stringify([
      { id: "1", type: "heading", content: "Hallo Welt 1" },
      { id: "2", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "3", type: "heading", content: "Hallo Welt 2" },
      { id: "4", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "5", type: "heading", content: "Hallo Welt 3" },
      { id: "6", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "7", type: "heading", content: "Hallo Welt 4" },
      { id: "8", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "9", type: "heading", content: "Hallo Welt 5" },
      { id: "10", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "11", type: "heading", content: "Hallo Welt" },
      { id: "12", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "13", type: "heading", content: "Hallo Welt" },
      { id: "14", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "15", type: "heading", content: "Hallo Welt" },
      { id: "16", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "17", type: "heading", content: "Hallo Welt" },
      { id: "18", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "19", type: "heading", content: "Hallo Welt" },
      { id: "20", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "21", type: "heading", content: "Hallo Welt" },
      { id: "22", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "23", type: "heading", content: "Hallo Welt" },
      { id: "24", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "25", type: "heading", content: "Hallo Welt" },
      { id: "26", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
          { id: "27", type: "heading", content: "Hallo Welt" },
      { id: "28", type: "text", content: "LLorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.  Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.  Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis.   At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, At accusam aliquyam diam diam dolore dolores duo eirmod eos erat, et nonumy sed tempor et et invidunt justo labore Stet clita ea et gubergren, kasd magna no rebum. sanctus sea sed takimata ut vero voluptua. est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat.  Consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus.  Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.  Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.  Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi.  Nam liber tempor cum soluta nobis eleifend option congue nihil imperdiet doming id quod mazim placerat facer possim assum. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat.  Duis autem vel eum iriure dolor in" },
          { id: "29", type: "heading", content: "Hallo Welt" },
      { id: "30", type: "text", content: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet." },
    
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: undefined
  },
    R70A25: {
    id: "R70A25",
    name: "⚡ Performance Test 5000 Blöcke",
    creator: "Admin",
    views: 12311,
    content: JSON.stringify(
      Array.from({ length: 5000 }).map((_, i) => ({
        id: `b${i}`,
        language: "javascript",
        type: i % 5 === 0 ? "heading" : i % 5 === 1 ? "text" : i % 5 === 2 ? "code" : i % 5 === 3 ? "list" : "quote",
        content:
          i % 5 === 0
            ? `Kapitel ${i / 5}`
            : i % 5 === 1
            ? `Dies ist ein Textblock Nummer ${i}`
            : i % 5 === 2
            ? `"use client";

type ArticleSkeletonProps = {
  blocksCount?: number;
};

export default function ArticleSkeleton({ blocksCount = 8 }: ArticleSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: blocksCount }).map((_, i) => (
        <div key={i} className="h-6 bg-gray-300 rounded animate-pulse" />
      ))}
    </div>
  );
}

bitte in eine zeile
 console.log("Block ${i}");`
            : i % 5 === 3
            ? `Punkt A${i}\nPunkt B${i}\nPunkt C${i}`
            : `Zitat Nummer ${i}`,
      }))
    ),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: "info"
  },
  R70A26: {
    id: "R70A26",
    name: "⚡ Performance Test: Wenige große Blöcke",
    creator: "Admin",
    views: 100,
    content: JSON.stringify([
      {
        id: "b0",
        type: "heading",
        content: "Header ".repeat(1000), // sehr großer Textblock
      },
      {
        id: "b1",
        type: "text",
        content: "Lorem ipsum ".repeat(1000), // sehr großer Textblock
      },
      {
        id: "b2",
        type: "code",
        content: "console.log('Sehr langer Codeblock');\n".repeat(200),
        language: "javascript"
      },
      {
        id: "b3",
        type: "quote",
        content: "Zitat ".repeat(500),
      },
    ]),
    category: undefined,
    description: undefined,
    lastUpdate: undefined,
    tag: "performance",
  },
  R70A27: {
  id: "R70A27",
  name: "⚡ Code Sprachen Test",
  creator: "Admin",
  views: 100,
  content: JSON.stringify([
    {
      id: "b0",
      type: "code",
      content: `function greet(name) {
  console.log(\`Hello, \${name}!\`);
}
greet("World");`,
      language: "javascript",
    },
    {
      id: "b1",
      type: "code",
      content: `function add(a: number, b: number): number {
  return a + b;
}
console.log(add(2, 3));`,
      language: "typescript",
    },
    {
      id: "b2",
      type: "code",
      content: `def square(x):
    return x * x

print(square(5))`,
      language: "python",
    },
    {
      id: "b3",
      type: "code",
      content: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hallo Java!");
  }
}`,
      language: "java",
    },
    {
      id: "b4",
      type: "code",
      content: `class Program {
  static void Main() {
    System.Console.WriteLine("Hello C#!");
  }
}`,
      language: "csharp",
    },
    {
      id: "b5",
      type: "code",
      content: `#include <iostream>
using namespace std;

int main() {
  cout << "Hallo C++!" << endl;
  return 0;
}`,
      language: "cpp",
    },
    {
      id: "b6",
      type: "code",
      content: `<?php
echo "Hello from PHP!";
?>`,
      language: "php",
    },
    {
      id: "b7",
      type: "code",
      content: `package main
import "fmt"

func main() {
  fmt.Println("Hello Go!")
}`,
      language: "go",
    },
    {
      id: "b8",
      type: "code",
      content: `fn main() {
    println!("Hello Rust!");
}`,
      language: "rust",
    },
    {
      id: "b9",
      type: "code",
      content: `SELECT id, name FROM users WHERE active = 1;`,
      language: "sql",
    },
    {
      id: "b10",
      type: "code",
      content: `<!DOCTYPE html>
<html>
  <body>
    <h1>Hello HTML!</h1>
  </body>
</html>`,
      language: "html",
    },
    {
      id: "b11",
      type: "code",
      content: `body {
  background: #222;
  color: white;
}`,
      language: "css",
    },
    {
      id: "b12",
      type: "code",
      content: `{
  "name": "Max",
  "age": 30
}`,
      language: "json",
    },
    {
      id: "b13",
      type: "code",
      content: `echo "Hello from Bash!"`,
      language: "bash",
    },
    {
      id: "b14",
      type: "code",
      content: `name: Max
age: 30`,
      language: "yaml",
    },
    {
      id: "b15",
      type: "code",
      content: `# Hallo Markdown
- Punkt 1
- Punkt 2`,
      language: "markdown",
    },
    {
      id: "b16",
      type: "code",
      content: `Write-Output "Hello PowerShell!"
Get-Process | Select-Object -First 5`,
      language: "ps1",
    },
  ]),
  category: undefined,
  description: undefined,
  lastUpdate: undefined,
  tag: "design",
}

};
  

export function getArticles(): Article[] {
  return Object.values(articles);
}

export function getArticleById(id: string): Article | null {
  return articles[id] ?? null;
}

export function updateArticle(id: string, newContent: string): Article | null {
  if (!articles[id]) return null;
  articles[id].content = newContent;
  return articles[id];
}
