"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Library,
  Star,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Telescope,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Book {
  book_id: number;
  title: string;
  authors: string;
  image_url: string;
  average_rating: number;
}

// ─── Inline BookCard (same design as collection page) ────────────────────────
function BookCard({ book }: { book: Book }) {
  return (
    <Link
      href={`/books/${book.book_id}`}
      className="group flex flex-col rounded-xl overflow-hidden border border-stone-200 bg-surface hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 shrink-0 w-36"
    >
      <div className="w-full h-52 bg-stone-100 overflow-hidden">
        <img
          src={book.image_url}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="font-serif font-semibold text-sm text-on-surface line-clamp-2 leading-snug mb-1">
          {book.title}
        </p>
        <p className="text-xs text-secondary line-clamp-1">{book.authors}</p>
      </div>
    </Link>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [isInCollection, setIsInCollection] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isRatingLoading, setIsRatingLoading] = useState(false);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);

  // AI Summary state
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // ML Recommendations state
  const [recommendations, setRecommendations] = useState<Book[] | null>(null);
  const [isRecsLoading, setIsRecsLoading] = useState(false);
  const [recsError, setRecsError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const bookId = params.id as string;

  // ── Fetch book details ────────────────────────────────────────────────────
  useEffect(() => {
    if (!bookId) return;
    const fetchBookDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/books/${bookId}`);
        if (res.ok) {
          setBook(await res.json());
        } else {
          console.error("Book not found");
        }
      } catch (err) {
        console.error("Failed to fetch book", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [bookId, API_URL]);

  // ── Sync collection status from AuthContext ───────────────────────────────
  useEffect(() => {
    if (user && user.favorites) {
      setIsInCollection(user.favorites.includes(Number(bookId)));
    } else {
      setIsInCollection(false);
    }
  }, [user, bookId]);

  // ── Fetch persisted rating ────────────────────────────────────────────────
  useEffect(() => {
    if (!user || !bookId) return;
    const fetchRating = async () => {
      try {
        const res = await fetch(`${API_URL}/ratings/${bookId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setRating(data.score ?? 0);
        }
      } catch (err) {
        console.error("Failed to fetch rating", err);
      }
    };
    fetchRating();
  }, [user, bookId, API_URL]);

  // ── Collection toggle ─────────────────────────────────────────────────────
  const toggleCollection = async () => {
    if (!user) { router.push("/login"); return; }
    setIsCollectionLoading(true);
    try {
      if (isInCollection) {
        const res = await fetch(`${API_URL}/users/collection/${bookId}`, {
          method: "DELETE",
          credentials: "include",
        });
        if (res.ok) await refreshUser();
      } else {
        const res = await fetch(`${API_URL}/users/collection`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ book_id: Number(bookId) }),
          credentials: "include",
        });
        if (res.ok) await refreshUser();
      }
    } catch (err) {
      console.error("Failed to toggle collection", err);
    } finally {
      setIsCollectionLoading(false);
    }
  };

  // ── Rating ────────────────────────────────────────────────────────────────
  const handleRating = async (score: number) => {
    if (!user) { router.push("/login"); return; }
    setRating(score); // optimistic update
    setIsRatingLoading(true);
    try {
      await fetch(`${API_URL}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: Number(bookId), score }),
        credentials: "include",
      });
    } catch (err) {
      console.error("Failed to submit rating", err);
      setRating(0); // rollback
    } finally {
      setIsRatingLoading(false);
    }
  };

  // ── AI Summary ────────────────────────────────────────────────────────────
  const generateSummary = async () => {
    if (!book) return;
    setSummaryError(null);
    setIsSummaryLoading(true);
    try {
      const res = await fetch("/api/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: book.title, authors: book.authors }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setSummary(data.summary);
    } catch (err: any) {
      setSummaryError(err.message ?? "Failed to generate summary.");
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // ── ML Recommendations ────────────────────────────────────────────────────
  const fetchRecommendations = async () => {
    setRecsError(null);
    setIsRecsLoading(true);
    try {
      const res = await fetch(`${API_URL}/recommendations/${bookId}`);
      if (!res.ok) throw new Error("No recommendations found for this book.");
      const data = await res.json();
      setRecommendations(data);
    } catch (err: any) {
      setRecsError(err.message ?? "Failed to fetch recommendations.");
    } finally {
      setIsRecsLoading(false);
    }
  };

  // ── Early returns ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-on-background">
        <h1 className="font-serif text-3xl font-bold mb-4">Book not found</h1>
        <Link href="/" className="text-primary hover:underline">Return Home</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-sans selection:bg-primary/30 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 sm:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-stone-200 bg-[#f5fbf5]/90 backdrop-blur-md">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <Library className="w-6 h-6" />
          <span className="font-serif font-bold text-xl tracking-tight text-on-surface">Cozy Library</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href="/collection" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              My Collection
            </Link>
          ) : (
            <Link href="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 sm:px-12">
        

        <div className="flex flex-col md:flex-row md:items-start gap-12">
          {/* ── Cover Column ─────────────────────────────────────────────── */}
          
          <div className="w-full md:w-1/3 shrink-0 sticky top-24 self-start">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-secondary hover:text-primary transition-colors mb-8">
          <ChevronLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
            <div className="w-48 md:w-56 mx-auto rounded-lg overflow-hidden shadow-lg border border-stone-200 bg-surface relative">
              <img src={book.image_url} alt={book.title} className="w-full aspect-2/3 object-cover" />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={toggleCollection}
                disabled={isCollectionLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all shadow-sm ${
                  isInCollection
                    ? "bg-surface border border-stone-300 text-on-surface hover:bg-stone-50"
                    : "bg-primary text-white hover:bg-primary/90"
                } disabled:opacity-70`}
              >
                {isCollectionLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                ) : isInCollection ? (
                  <><BookmarkCheck className="w-5 h-5 text-primary" /> Remove from Collection</>
                ) : (
                  <><Bookmark className="w-5 h-5" /> Add to Collection</>
                )}
              </button>

              {/* Star Rating */}
              <div className="bg-surface border border-stone-200 rounded-lg p-4 flex flex-col items-center shadow-sm">
                <span className="text-xs font-semibold text-secondary uppercase tracking-wider mb-2">Rate this book</span>
                <div className="flex gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      disabled={isRatingLoading}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      className="p-1 disabled:opacity-50 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= (hoverRating || rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-stone-300"
                        } transition-colors`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Details Column ───────────────────────────────────────────── */}
          <div className="w-full md:w-2/3 flex flex-col gap-8">
            <div>
              <h1 className="font-serif text-4xl sm:text-5xl font-semibold leading-tight text-on-surface mb-2">
                {book.title}
              </h1>
              <p className="text-xl text-secondary mb-6">{book.authors}</p>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-primary text-primary" />
                <span className="font-medium text-lg text-on-surface">{book.average_rating.toFixed(2)}</span>
                <span className="text-secondary">/ 5 (Goodreads Average)</span>
              </div>
            </div>

            {/* ── AI Summary ────────────────────────────────────────────── */}
            <section className="bg-surface rounded-2xl border border-primary/20 shadow-sm overflow-hidden">
              {/* Accent bar */}
              <div className="h-1 w-full bg-linear-to-r from-primary to-emerald-400" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-semibold text-on-surface">Summary</h2>
                    <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded-full">AI</span>
                  </div>
                  {!summary && !isSummaryLoading && (
                    <button
                      onClick={generateSummary}
                      className="inline-flex items-center gap-2 bg-primary text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate
                    </button>
                  )}
                </div>

                {/* States */}
                {isSummaryLoading && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
                    <p className="text-sm text-secondary animate-pulse">Asking AI to read the book…</p>
                  </div>
                )}

                {summaryError && !isSummaryLoading && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-red-500">{summaryError}</p>
                    <button
                      onClick={generateSummary}
                      className="self-start text-sm text-primary underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {summary && !isSummaryLoading && (
                  <div className="space-y-4">
                    {summary.split("\n\n").filter(Boolean).map((para, i) => (
                      <p key={i} className="font-serif text-on-surface leading-relaxed text-[1.05rem]">
                        {para}
                      </p>
                    ))}
                  </div>
                )}

                {!summary && !isSummaryLoading && !summaryError && (
                  <p className="text-secondary text-sm leading-relaxed italic">
                    Click <strong className="text-on-surface not-italic">Generate</strong> to get an AI-crafted 
                    editorial summary of this book, powered by Gemini.
                  </p>
                )}
              </div>
            </section>

            {/* ── ML Recommendations ────────────────────────────────────── */}
            <section className="bg-surface rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="h-1 w-full bg-linear-to-r from-stone-300 to-stone-200" />
              <div className="p-6 sm:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-2xl font-semibold text-on-surface">Similar Books</h2>
                    <span className="text-xs font-medium bg-stone-100 text-secondary px-3 py-1 rounded-full">ML</span>
                  </div>
                  {!recommendations && !isRecsLoading && (
                    <button
                      onClick={fetchRecommendations}
                      className="inline-flex items-center gap-2 bg-surface border border-stone-300 text-on-surface text-sm font-medium px-4 py-2 rounded-full hover:bg-stone-50 transition-colors shadow-sm"
                    >
                      <Telescope className="w-4 h-4 text-secondary" />
                      Discover
                    </button>
                  )}
                </div>

                {isRecsLoading && (
                  <div className="flex flex-col items-center justify-center py-8 gap-3">
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-stone-400" />
                    <p className="text-sm text-secondary animate-pulse">Finding similar reads…</p>
                  </div>
                )}

                {recsError && !isRecsLoading && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-red-500">{recsError}</p>
                    <button
                      onClick={fetchRecommendations}
                      className="self-start text-sm text-primary underline hover:no-underline"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {recommendations && !isRecsLoading && (
                  <div className="flex gap-4 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                    {recommendations.map((rec) => (
                      <div key={rec.book_id} className="snap-start shrink-0">
                        <BookCard book={rec} />
                      </div>
                    ))}
                  </div>
                )}

                {!recommendations && !isRecsLoading && !recsError && (
                  <p className="text-secondary text-sm leading-relaxed italic">
                    Click <strong className="text-on-surface not-italic">Discover</strong> to find books 
                    with similar themes, using our content-based ML recommender.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
