import os
import json
import queue
import threading
import requests
import tkinter as tk
from tkinter import ttk, messagebox, filedialog
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path


OLLAMA_URL = "http://localhost:11434/api/chat"


@dataclass
class BookProject:
    title: str
    description: str
    genre: str = ""
    audience: str = ""
    tone: str = ""
    language: str = "English"
    chapter_target: int = 20
    words_per_chapter: int = 2500
    output_file: str = ""
    current_chapter: int = 0
    chosen_ideas: list = field(default_factory=list)
    chapter_summaries: list = field(default_factory=list)
    chapter_titles: list = field(default_factory=list)
    history: list = field(default_factory=list)

    def ensure_output_file(self, output_dir: Path):
        if not self.output_file:
            safe_title = "".join(c if c.isalnum() or c in (" ", "-", "_") else "_" for c in self.title).strip()
            safe_title = safe_title.replace(" ", "_")
            self.output_file = str(output_dir / f"{safe_title}.txt")


class OllamaBookWriterGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Ollama Book Writer")
        self.root.geometry("1180x780")

        self.books = []
        self.selected_book = None
        self.ui_queue = queue.Queue()
        self.worker_running = False

        self.model_var = tk.StringVar(value="qwen3.5")
        self.output_dir_var = tk.StringVar(value=str(Path.cwd() / "generated_books"))
        self.books_file_var = tk.StringVar(value=str(Path.cwd() / "books.json"))
        self.status_var = tk.StringVar(value="Ready.")
        self.chapter_target_var = tk.StringVar(value="20")
        self.words_var = tk.StringVar(value="2500")

        self.idea_vars = []
        self.idea_radio_var = tk.IntVar(value=-1)

        self._build_ui()
        self.root.after(100, self.process_ui_queue)

    def _build_ui(self):
        top = ttk.Frame(self.root, padding=10)
        top.pack(fill="x")

        ttk.Label(top, text="Model:").grid(row=0, column=0, sticky="w")
        ttk.Entry(top, textvariable=self.model_var, width=20).grid(row=0, column=1, padx=5)

        ttk.Label(top, text="Books file:").grid(row=0, column=2, sticky="w", padx=(10, 0))
        ttk.Entry(top, textvariable=self.books_file_var, width=45).grid(row=0, column=3, padx=5)
        ttk.Button(top, text="Browse", command=self.browse_books_file).grid(row=0, column=4, padx=5)
        ttk.Button(top, text="Load Books", command=self.load_books).grid(row=0, column=5, padx=5)

        ttk.Label(top, text="Output dir:").grid(row=1, column=0, sticky="w", pady=(8, 0))
        ttk.Entry(top, textvariable=self.output_dir_var, width=45).grid(row=1, column=1, columnspan=3, sticky="we", padx=5, pady=(8, 0))
        ttk.Button(top, text="Browse", command=self.browse_output_dir).grid(row=1, column=4, padx=5, pady=(8, 0))

        ttk.Label(top, text="Chapters:").grid(row=1, column=5, sticky="e", pady=(8, 0))
        ttk.Entry(top, textvariable=self.chapter_target_var, width=6).grid(row=1, column=6, padx=5, pady=(8, 0))

        ttk.Label(top, text="Words/chapter:").grid(row=1, column=7, sticky="e", pady=(8, 0))
        ttk.Entry(top, textvariable=self.words_var, width=8).grid(row=1, column=8, padx=5, pady=(8, 0))

        main = ttk.Panedwindow(self.root, orient="horizontal")
        main.pack(fill="both", expand=True, padx=10, pady=10)

        left = ttk.Frame(main, padding=8)
        center = ttk.Frame(main, padding=8)
        right = ttk.Frame(main, padding=8)

        main.add(left, weight=1)
        main.add(center, weight=2)
        main.add(right, weight=2)

        ttk.Label(left, text="Books").pack(anchor="w")
        self.book_list = tk.Listbox(left, height=30)
        self.book_list.pack(fill="both", expand=True, pady=5)
        self.book_list.bind("<<ListboxSelect>>", self.on_book_select)

        btns = ttk.Frame(left)
        btns.pack(fill="x", pady=5)
        ttk.Button(btns, text="Generate 5 Ideas", command=self.generate_ideas).pack(fill="x", pady=2)
        ttk.Button(btns, text="Write Selected Chapter", command=self.write_selected_chapter).pack(fill="x", pady=2)
        ttk.Button(btns, text="Auto Finish to Chapter 20", command=self.auto_finish_book).pack(fill="x", pady=2)
        ttk.Button(btns, text="Open Output Folder", command=self.open_output_folder).pack(fill="x", pady=2)

        ttk.Label(center, text="Book Context").pack(anchor="w")
        self.context_text = tk.Text(center, wrap="word", height=18)
        self.context_text.pack(fill="both", expand=True, pady=(5, 10))

        ttk.Label(center, text="Generated Ideas").pack(anchor="w")
        ideas_frame = ttk.Frame(center)
        ideas_frame.pack(fill="both", expand=True)

        for i in range(5):
            rb = ttk.Radiobutton(
                ideas_frame,
                text=f"Idea {i+1}",
                variable=self.idea_radio_var,
                value=i
            )
            rb.grid(row=i * 2, column=0, sticky="w", pady=(4, 0))
            txt = tk.Text(ideas_frame, wrap="word", height=4, width=52)
            txt.grid(row=i * 2 + 1, column=0, sticky="nsew", pady=(0, 6))
            self.idea_vars.append(txt)

        ideas_frame.columnconfigure(0, weight=1)

        ttk.Label(right, text="Log / Preview").pack(anchor="w")
        self.log_text = tk.Text(right, wrap="word")
        self.log_text.pack(fill="both", expand=True, pady=5)

        bottom = ttk.Frame(self.root, padding=10)
        bottom.pack(fill="x")
        ttk.Label(bottom, textvariable=self.status_var).pack(side="left")

    def browse_books_file(self):
        path = filedialog.askopenfilename(filetypes=[("JSON files", "*.json"), ("All files", "*.*")])
        if path:
            self.books_file_var.set(path)

    def browse_output_dir(self):
        path = filedialog.askdirectory()
        if path:
            self.output_dir_var.set(path)

    def open_output_folder(self):
        path = Path(self.output_dir_var.get())
        path.mkdir(parents=True, exist_ok=True)
        messagebox.showinfo("Output folder", f"Files are saved in:\n{path}")

    def log(self, msg):
        timestamp = datetime.now().strftime("%H:%M:%S")
        self.log_text.insert("end", f"[{timestamp}] {msg}\n")
        self.log_text.see("end")

    def set_status(self, text):
        self.status_var.set(text)

    def process_ui_queue(self):
        try:
            while True:
                kind, payload = self.ui_queue.get_nowait()
                if kind == "log":
                    self.log(payload)
                elif kind == "status":
                    self.set_status(payload)
                elif kind == "ideas":
                    for i, box in enumerate(self.idea_vars):
                        box.delete("1.0", "end")
                        if i < len(payload):
                            box.insert("1.0", payload[i])
                    self.idea_radio_var.set(-1)
                elif kind == "context":
                    self.context_text.delete("1.0", "end")
                    self.context_text.insert("1.0", payload)
                elif kind == "refresh_books":
                    self.refresh_book_list()
                elif kind == "done":
                    self.worker_running = False
        except queue.Empty:
            # No more messages; this is expected and not an error.
            pass
        finally:
            self.root.after(100, self.process_ui_queue)

    def load_books(self):
        path = Path(self.books_file_var.get())
        if not path.exists():
            messagebox.showerror("Error", "books.json not found.")
            return

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
            books = []
            for item in data:
                book = BookProject(
                    title=item["title"],
                    description=item["description"],
                    genre=item.get("genre", ""),
                    audience=item.get("audience", ""),
                    tone=item.get("tone", ""),
                    language=item.get("language", "English"),
                    chapter_target=int(self.chapter_target_var.get()),
                    words_per_chapter=int(self.words_var.get()),
                )
                books.append(book)

            self.books = books
            self.refresh_book_list()
            self.ui_queue.put(("status", f"Loaded {len(self.books)} books."))
            self.ui_queue.put(("log", f"Loaded {len(self.books)} books from {path}"))
        except Exception as e:
            messagebox.showerror("Error", f"Cannot read books file:\n{e}")

    def refresh_book_list(self):
        self.book_list.delete(0, "end")
        for b in self.books:
            self.book_list.insert("end", f"{b.title}  [Chapter {b.current_chapter}/{b.chapter_target}]")

    def on_book_select(self, event=None):
        sel = self.book_list.curselection()
        if not sel:
            return
        idx = sel[0]
        self.selected_book = self.books[idx]
        self.show_selected_book_context()

    def show_selected_book_context(self):
        if not self.selected_book:
            return

        b = self.selected_book
        lines = [
            f"Title: {b.title}",
            f"Genre: {b.genre}",
            f"Audience: {b.audience}",
            f"Tone: {b.tone}",
            f"Language: {b.language}",
            f"Target chapters: {b.chapter_target}",
            f"Words per chapter: {b.words_per_chapter}",
            "",
            "Book description:",
            b.description,
            "",
            "Chosen ideas so far:",
        ]
        for i, idea in enumerate(b.chosen_ideas, 1):
            lines.append(f"{i}. {idea}")

        lines.append("")
        lines.append("Chapter summaries:")
        for i, s in enumerate(b.chapter_summaries, 1):
            lines.append(f"Chapter {i}: {s}")

        self.ui_queue.put(("context", "\n".join(lines)))

    def build_book_system_prompt(self, book: BookProject):
        return f"""
You are a professional English-language novelist and long-form fiction ghostwriter.

You are writing ONE SPECIFIC BOOK and must maintain absolute consistency for:
- title
- genre
- tone
- target audience
- plot logic
- worldbuilding
- character motivations
- names
- timeline
- chapter continuity

Book title: {book.title}
Genre: {book.genre}
Audience: {book.audience}
Tone: {book.tone}
Language: {book.language}

Core book description:
{book.description}

Rules:
1. Write only in fluent, natural English.
2. Keep continuity with previous chapters and summaries.
3. Do not restart the story from scratch.
4. Do not contradict previous events unless explicitly requested.
5. Each chapter must feel like part of the same novel.
6. Prefer concrete scenes, dialogue, sensory detail, and narrative momentum.
7. Avoid generic filler.
8. The book should grow toward a complete 20-chapter novel.
9. When asked for ideas, provide exactly 5 distinct strong plot directions.
10. When asked for a chapter, return only the chapter content unless explicitly asked otherwise.
""".strip()

    def build_context_messages(self, book: BookProject):
        messages = [{"role": "system", "content": self.build_book_system_prompt(book)}]

        if book.current_chapter == 0:
            starter = f"""
We are starting a new book.

Book title: {book.title}
Book description:
{book.description}

Write with strong continuity from this concept.
Keep this book distinct from any other book.
""".strip()
            messages.append({"role": "user", "content": starter})
        else:
            history_text = []
            for i, summary in enumerate(book.chapter_summaries, 1):
                title = book.chapter_titles[i - 1] if i - 1 < len(book.chapter_titles) else f"Chapter {i}"
                history_text.append(f"{title}: {summary}")

            messages.append({
                "role": "user",
                "content": "Story so far:\n" + "\n".join(history_text)
            })

        return messages

    def ollama_chat(self, model, messages, temperature=0.9):
        payload = {
            "model": model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": temperature
            }
        }
        r = requests.post(OLLAMA_URL, json=payload, timeout=3600)
        r.raise_for_status()
        data = r.json()
        return data["message"]["content"]

    def generate_ideas(self):
        if self.worker_running:
            return
        if not self.selected_book:
            messagebox.showwarning("Warning", "Select a book first.")
            return

        self.worker_running = True
        thread = threading.Thread(target=self._generate_ideas_worker, daemon=True)
        thread.start()

    def _generate_ideas_worker(self):
        try:
            b = self.selected_book
            self.ui_queue.put(("status", f"Generating ideas for '{b.title}'..."))
            self.ui_queue.put(("log", f"Generating 5 ideas for chapter {b.current_chapter + 1}"))

            chapter_number = b.current_chapter + 1
            messages = self.build_context_messages(b)
            prompt = f"""
Propose exactly 5 different strong ideas for Chapter {chapter_number} of this novel.

Requirements:
- Each idea must be consistent with the book description and previous chapter summaries.
- Each idea must move the plot forward in a meaningful way.
- Make the 5 options clearly different in tension, revelation, pacing, or conflict.
- Each idea must be 90-160 words.
- Return ONLY valid JSON in this exact format:

{{
  "ideas": [
    "idea 1",
    "idea 2",
    "idea 3",
    "idea 4",
    "idea 5"
  ]
}}
""".strip()
            messages.append({"role": "user", "content": prompt})

            raw = self.ollama_chat(self.model_var.get(), messages, temperature=1.0)

            ideas = self.extract_ideas_json(raw)
            self.ui_queue.put(("ideas", ideas))
            self.ui_queue.put(("status", "Ideas generated. Choose one and write the chapter."))
            self.ui_queue.put(("log", "Ideas ready."))
            self.show_selected_book_context()
        except Exception as e:
            self.ui_queue.put(("log", f"ERROR generating ideas: {e}"))
            self.ui_queue.put(("status", "Error while generating ideas."))
        finally:
            self.ui_queue.put(("done", None))

    def extract_ideas_json(self, raw):
        raw = raw.strip()
        try:
            data = json.loads(raw)
            ideas = data.get("ideas", [])
            if len(ideas) != 5:
                raise ValueError("Model did not return exactly 5 ideas.")
            return ideas
        except Exception:
            start = raw.find("{")
            end = raw.rfind("}")
            if start != -1 and end != -1 and end > start:
                data = json.loads(raw[start:end + 1])
                ideas = data.get("ideas", [])
                if len(ideas) == 5:
                    return ideas
            raise ValueError("Could not parse ideas JSON from model output.")

    def write_selected_chapter(self):
        if self.worker_running:
            return
        if not self.selected_book:
            messagebox.showwarning("Warning", "Select a book first.")
            return
        idx = self.idea_radio_var.get()
        if idx < 0 or idx > 4:
            messagebox.showwarning("Warning", "Choose one of the 5 ideas first.")
            return

        idea = self.idea_vars[idx].get("1.0", "end").strip()
        if not idea:
            messagebox.showwarning("Warning", "Selected idea is empty.")
            return

        self.worker_running = True
        thread = threading.Thread(target=self._write_chapter_worker, args=(idea,), daemon=True)
        thread.start()

    def _write_chapter_worker(self, chosen_idea):
        try:
            b = self.selected_book
            output_dir = Path(self.output_dir_var.get())
            output_dir.mkdir(parents=True, exist_ok=True)
            b.ensure_output_file(output_dir)

            chapter_number = b.current_chapter + 1
            self.ui_queue.put(("status", f"Writing chapter {chapter_number} for '{b.title}'..."))
            self.ui_queue.put(("log", f"Writing chapter {chapter_number} using selected idea..."))

            messages = self.build_context_messages(b)
            prompt = f"""
Write Chapter {chapter_number} of the novel.

Selected plot direction for this chapter:
{chosen_idea}

Requirements:
- Write in English only.
- Length target: about {b.words_per_chapter} words.
- Make the prose polished, readable, and novel-like.
- Include dialogue when useful.
- Build on the previous chapters and keep continuity.
- The chapter must end in a way that invites the next chapter.
- Do not summarize the whole story.
- Output format:

TITLE: <chapter title>

CHAPTER_TEXT:
<full chapter text>

SUMMARY:
<120-180 word summary of this chapter for continuity memory>
""".strip()
            messages.append({"role": "user", "content": prompt})

            raw = self.ollama_chat(self.model_var.get(), messages, temperature=0.85)
            title, chapter_text, summary = self.extract_chapter_parts(raw, chapter_number)

            b.current_chapter += 1
            b.chosen_ideas.append(chosen_idea)
            b.chapter_titles.append(title)
            b.chapter_summaries.append(summary)
            self.append_chapter_to_file(b, title, chapter_text, summary)

            self.ui_queue.put(("log", f"Saved chapter {b.current_chapter}: {title}"))
            self.ui_queue.put(("status", f"Chapter {b.current_chapter} completed."))
            self.ui_queue.put(("refresh_books", None))
            self.show_selected_book_context()

            for box in self.idea_vars:
                box.delete("1.0", "end")
            self.idea_radio_var.set(-1)

            if b.current_chapter >= b.chapter_target:
                self.ui_queue.put(("log", f"Book finished: {b.title}"))
                self.ui_queue.put(("status", f"Book finished: {b.title}"))
        except Exception as e:
            self.ui_queue.put(("log", f"ERROR writing chapter: {e}"))
            self.ui_queue.put(("status", "Error while writing chapter."))
        finally:
            self.ui_queue.put(("done", None))

    def extract_chapter_parts(self, raw, chapter_number):
        text = raw.strip()

        title = f"Chapter {chapter_number}"
        summary = "No summary extracted."
        chapter_text = text

        if "TITLE:" in text and "CHAPTER_TEXT:" in text and "SUMMARY:" in text:
            try:
                title_part = text.split("TITLE:", 1)[1].split("CHAPTER_TEXT:", 1)[0].strip()
                chapter_part = text.split("CHAPTER_TEXT:", 1)[1].split("SUMMARY:", 1)[0].strip()
                summary_part = text.split("SUMMARY:", 1)[1].strip()
                title = title_part if title_part else title
                chapter_text = chapter_part if chapter_part else chapter_text
                summary = summary_part if summary_part else summary
            except Exception:
                pass

        return title, chapter_text, summary

    def append_chapter_to_file(self, book: BookProject, title: str, chapter_text: str, summary: str):
        header = []
        file_exists = Path(book.output_file).exists()

        if not file_exists:
            header.extend([
                f"BOOK TITLE: {book.title}",
                f"GENRE: {book.genre}",
                f"AUDIENCE: {book.audience}",
                f"TONE: {book.tone}",
                "",
                "DESCRIPTION:",
                book.description,
                "",
                "=" * 80,
                ""
            ])

        chapter_block = [
            f"CHAPTER {book.current_chapter}: {title}",
            "-" * 80,
            chapter_text,
            "",
            "[SUMMARY MEMORY]",
            summary,
            "",
            "=" * 80,
            ""
        ]

        with open(book.output_file, "a", encoding="utf-8") as f:
            if header:
                f.write("\n".join(header))
            f.write("\n".join(chapter_block))

    def auto_finish_book(self):
        if self.worker_running:
            return
        if not self.selected_book:
            messagebox.showwarning("Warning", "Select a book first.")
            return

        if self.selected_book.current_chapter >= self.selected_book.chapter_target:
            messagebox.showinfo("Info", "This book is already complete.")
            return

        confirm = messagebox.askyesno(
            "Confirm",
            "The program will repeatedly ask for 5 ideas, automatically choose idea 1, and generate chapters until the final chapter. Continue?"
        )
        if not confirm:
            return

        self.worker_running = True
        thread = threading.Thread(target=self._auto_finish_worker, daemon=True)
        thread.start()

    def _auto_finish_worker(self):
        try:
            b = self.selected_book
            while b.current_chapter < b.chapter_target:
                self.ui_queue.put(("status", f"Auto mode: ideas for chapter {b.current_chapter + 1}"))
                self.ui_queue.put(("log", f"Auto mode: generating ideas for chapter {b.current_chapter + 1}"))

                messages = self.build_context_messages(b)
                prompt = f"""
Propose exactly 5 different strong ideas for Chapter {b.current_chapter + 1}.
Return ONLY valid JSON:
{{"ideas":["idea 1","idea 2","idea 3","idea 4","idea 5"]}}
""".strip()
                messages.append({"role": "user", "content": prompt})
                raw = self.ollama_chat(self.model_var.get(), messages, temperature=1.0)
                ideas = self.extract_ideas_json(raw)

                chosen_idea = ideas[0]
                self.ui_queue.put(("ideas", ideas))
                self.ui_queue.put(("log", f"Auto-selected idea 1 for chapter {b.current_chapter + 1}"))

                output_dir = Path(self.output_dir_var.get())
                output_dir.mkdir(parents=True, exist_ok=True)
                b.ensure_output_file(output_dir)

                messages = self.build_context_messages(b)
                chapter_prompt = f"""
Write Chapter {b.current_chapter + 1} of the novel.

Selected plot direction:
{chosen_idea}

Requirements:
- Write in English only.
- Length target: about {b.words_per_chapter} words.
- Strong continuity.
- Natural prose.
- End with momentum for the next chapter.

Output format:

TITLE: <chapter title>

CHAPTER_TEXT:
<full chapter text>

SUMMARY:
<120-180 word summary>
""".strip()
                messages.append({"role": "user", "content": chapter_prompt})

                raw_chapter = self.ollama_chat(self.model_var.get(), messages, temperature=0.85)
                title, chapter_text, summary = self.extract_chapter_parts(raw_chapter, b.current_chapter + 1)

                b.current_chapter += 1
                b.chosen_ideas.append(chosen_idea)
                b.chapter_titles.append(title)
                b.chapter_summaries.append(summary)
                self.append_chapter_to_file(b, title, chapter_text, summary)

                self.ui_queue.put(("log", f"Auto mode saved chapter {b.current_chapter}: {title}"))
                self.ui_queue.put(("refresh_books", None))
                self.show_selected_book_context()

            self.ui_queue.put(("status", f"Auto mode finished: {b.title}"))
            self.ui_queue.put(("log", f"Auto mode finished book: {b.title}"))
        except Exception as e:
            self.ui_queue.put(("log", f"AUTO MODE ERROR: {e}"))
            self.ui_queue.put(("status", "Auto mode failed."))
        finally:
            self.ui_queue.put(("done", None))


def ensure_sample_books_json(path: Path):
    if path.exists():
        return
    sample = [
        {
            "title": "The Last Observatory",
            "description": "A young atmospheric physicist discovers that a remote coastal observatory has been tracking not weather, but impossible signals tied to missing ships, vanished researchers, and a storm that returns every nineteen years. The novel should mix mystery, emotional tension, scientific realism, and a slow-burn supernatural thread.",
            "genre": "Science mystery / speculative thriller",
            "audience": "Adult",
            "tone": "Atmospheric, intelligent, emotionally tense",
            "language": "English"
        },
        {
            "title": "Ashes of the Glass Empire",
            "description": "In a declining fantasy empire built on living crystal technology, an apprentice archivist and a disgraced military engineer uncover a conspiracy that could collapse the capital. The story should include political intrigue, character growth, betrayal, and a gradual reveal of forgotten ancient machinery.",
            "genre": "Epic fantasy",
            "audience": "Young adult / adult crossover",
            "tone": "Vivid, adventurous, emotionally rich",
            "language": "English"
        }
    ]
    path.write_text(json.dumps(sample, indent=2, ensure_ascii=False), encoding="utf-8")


if __name__ == "__main__":
    ensure_sample_books_json(Path("books.json"))
    root = tk.Tk()
    app = OllamaBookWriterGUI(root)
    root.mainloop()
