"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Library, BookmarkX, Plus, Search, Star, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Book {
  book_id: number;
  title: string;
  authors: string;
  image_url: string;
  average_rating: number;
}

interface Rating {
  book_id: number;
  score: number;
}

function StarDisplay({ score }: { score: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`w-3.5 h-3.5 ${
            s <= score ? "fill-yellow-400 text-yellow-400" : "text-stone-300"
          }`}
        />
      ))}
    </div>
  );
}

function BookCard({ book, rating }: { book: Book; rating?: number }) {
  return (
    <Link
      href={`/books/${book.book_id}`}
      className="group cursor-pointer bg-surface rounded-md overflow-hidden border border-outline-variant hover:border-primary/50 shadow-md transition-all hover:-translate-y-1 h-full flex flex-col"
    >
      <div className="aspect-2/3 overflow-hidden relative w-full">
        <div className="absolute inset-0 bg-linear-to-t from-surface-dim to-transparent opacity-0 group-hover:opacity-20 transition-opacity z-10" />
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-sm"
        />
      </div>
      <div className="p-3 relative z-20 bg-surface flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-semibold text-sm line-clamp-2 mb-0.5 group-hover:text-primary transition-colors text-on-surface">
            {book.title}
          </h3>
          <p className="text-xs text-secondary line-clamp-1">{book.authors}</p>
        </div>
        {rating && rating > 0 ? (
          <div className="mt-2">
            <StarDisplay score={rating} />
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-0.5" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((s) => (
        <button
          key={s}
          type="button"
          onMouseEnter={() => setHover(s)}
          onClick={() => onChange(s)}
          className="p-0.5 focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 ${
              s <= (hover || value)
                ? "fill-yellow-400 text-yellow-400"
                : "text-stone-300"
            } transition-colors`}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Add Book Modal ──────────────────────────────────────────────────────────
function AddBookModal({
  onClose,
  onAdded,
  API_URL,
}: {
  onClose: () => void;
  onAdded: () => void;
  API_URL: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Book[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [pendingRatings, setPendingRatings] = useState<Record<number, number>>({});
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(
        `${API_URL}/books?search=${encodeURIComponent(query)}`
      );
      if (res.ok) setResults(await res.json());
    } catch (err) {
      console.error("Modal search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = async (book: Book) => {
    setAddingId(book.book_id);
    try {
      await fetch(`${API_URL}/users/collection`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id }),
        credentials: "include",
      });

      const score = pendingRatings[book.book_id];
      if (score && score > 0) {
        await fetch(`${API_URL}/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book_id: book.book_id, score }),
          credentials: "include",
        });
      }

      onAdded();
      onClose();
    } catch (err) {
      console.error("Failed to add book", err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    // ✅ FIX: Backdrop with proper centering; modal has explicit min/max width
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-2xl min-w-[320px] rounded-2xl shadow-2xl border border-stone-200 flex flex-col max-h-[88vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 shrink-0">
          <h2 className="font-serif text-xl font-semibold text-on-surface">
            Add a Book
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-secondary hover:text-on-surface hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ✅ FIX: Search bar — full width row, input expands, button stays right */}
        <form onSubmit={handleSearch} className="px-6 py-4 shrink-0">
          <div className="flex items-center w-full bg-stone-50 border border-stone-200 rounded-full focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all overflow-hidden">
            <Search className="w-4 h-4 text-secondary ml-4 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title..."
              autoFocus
              className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-sm outline-none text-on-surface placeholder:text-stone-400"
            />
            <button
              type="submit"
              disabled={isSearching}
              className="shrink-0 bg-primary text-white text-sm font-medium px-5 py-2.5 hover:bg-primary/90 transition-colors disabled:opacity-70 rounded-full m-1"
            >
              {isSearching ? "..." : "Go"}
            </button>
          </div>
        </form>

        {/* Scrollable Results */}
        <div className="overflow-y-auto flex-1 px-6 pb-6 max-h-[60vh]">
          {results.length === 0 ? (
            <p className="text-center text-secondary text-sm py-8">
              {query
                ? "No results found."
                : "Search for a book to add it to your collection."}
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {results.map((book) => (
                <li
                  key={book.book_id}
                  className="flex items-center gap-5 p-4 rounded-2xl border border-stone-100 hover:border-primary/30 hover:bg-primary/5 bg-stone-50 transition-colors"
                >
                  {/* Cover thumbnail — taller for better visual impact */}
                  <img
                    src={book.image_url}
                    alt={book.title}
                    className="w-14 h-20 object-cover rounded-lg shrink-0 shadow-md"
                  />

                  {/* Info + star rating — take all available space */}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif font-semibold text-base text-on-surface line-clamp-2 mb-1 leading-snug">
                      {book.title}
                    </p>
                    <p className="text-sm text-secondary line-clamp-1 mb-3">
                      {book.authors}
                    </p>
                    <StarPicker
                      value={pendingRatings[book.book_id] ?? 0}
                      onChange={(v) =>
                        setPendingRatings((prev) => ({
                          ...prev,
                          [book.book_id]: v,
                        }))
                      }
                    />
                  </div>

                  {/* Add button — aligned to vertical center */}
                  <button
                    onClick={() => handleAdd(book)}
                    disabled={addingId === book.book_id}
                    className="shrink-0 bg-primary text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-60 shadow-sm"
                  >
                    {addingId === book.book_id ? "Adding…" : "Add"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function CollectionPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterQuery, setFilterQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const ratingMap = ratings.reduce<Record<number, number>>((acc, r) => {
    acc[r.book_id] = r.score;
    return acc;
  }, {});

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [collectionRes, ratingsRes] = await Promise.all([
        fetch(`${API_URL}/users/collection`, { credentials: "include" }),
        fetch(`${API_URL}/ratings`, { credentials: "include" }),
      ]);
      if (collectionRes.ok) setBooks(await collectionRes.json());
      if (ratingsRes.ok) setRatings(await ratingsRes.json());
    } catch (err) {
      console.error("Failed to fetch collection data", err);
    } finally {
      setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (user) fetchData();
  }, [user, fetchData]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/30 flex flex-col">
        {/* Header */}
        <header className="w-full px-6 py-4 sm:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-stone-200 bg-[#f5fbf5]/90 backdrop-blur-md">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity"
          >
            <Library className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight text-on-surface">
              Cozy Library
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-on-surface">
              Hello, {user?.name.split(" ")[0]}
            </span>
            <Link
              href="/"
              className="text-sm font-medium text-secondary hover:text-primary transition-colors"
            >
              Home
            </Link>
            <button
              onClick={() => logout()}
              className="text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 sm:px-12">
          {/* Title + Controls Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="font-serif text-4xl font-semibold text-on-surface">
              My Collection
            </h1>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Filter by title..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="bg-surface border border-stone-200 rounded-full px-4 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-surface flex-1 sm:min-w-[220px]"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm shrink-0"
              >
                <Plus className="w-4 h-4" />
                Add Book
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors shrink-0"
              >
                Discover
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : books.length === 0 ? (
            // ✅ FIX: Empty state — remove max-w constraint on the paragraph so text wraps normally
            <div className="bg-surface border border-stone-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-5">
                <BookmarkX className="w-8 h-8 text-stone-400" />
              </div>
              <h2 className="font-serif text-2xl font-semibold text-on-surface mb-3">
                Your collection is empty
              </h2>
              <p className="text-secondary mb-8  mx-auto leading-relaxed text-center">
                You haven't added any books yet. Use the{" "}
                <strong className="text-on-surface">Add Book</strong> button
                above, or browse the discovery page to find your next read.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary text-white px-6 py-2.5 rounded-full font-medium text-sm hover:bg-primary/90 transition-colors shadow-sm"
                >
                  Add Book
                </button>
                <Link
                  href="/"
                  className="border border-stone-300 text-on-surface px-6 py-2.5 rounded-full font-medium text-sm hover:bg-stone-50 transition-colors"
                >
                  Browse Books
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {filteredBooks.map((book) => (
                <BookCard
                  key={book.book_id}
                  book={book}
                  rating={ratingMap[book.book_id]}
                />
              ))}
              {filteredBooks.length === 0 && filterQuery && (
                <div className="col-span-full py-12 text-center text-secondary bg-surface rounded-xl border border-stone-100">
                  No books match your filter.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <AddBookModal
          onClose={() => setIsModalOpen(false)}
          onAdded={fetchData}
          API_URL={API_URL}
        />
      )}
    </ProtectedRoute>
  );
}