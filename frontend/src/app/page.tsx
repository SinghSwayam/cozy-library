"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Library, Sparkles, BrainCircuit } from "lucide-react";
import { readingQuotes } from "@/lib/quotes";
import { useAuth } from "@/context/AuthContext";

interface Book {
  book_id: number;
  title: string;
  authors: string;
  image_url: string;
  average_rating: number;
}

// BookCard Component (Static for Marquee)
function BookCard({ book }: { book: Book }) {
  return (
    <Link href={`/books/${book.book_id}`} className="w-48 shrink-0 group cursor-pointer bg-surface rounded-md overflow-hidden border border-outline-variant hover:border-primary/50 shadow-md transition-all hover:-translate-y-1 block">
      <div className="aspect-2/3 overflow-hidden relative">
        <div className="absolute inset-0 bg-linear-to-t from-surface-dim to-transparent opacity-0 group-hover:opacity-20 transition-opacity z-10" />
        <img src={book.image_url} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 rounded-sm" />
      </div>
      <div className="p-4 relative z-20 bg-surface">
        <h3 className="font-serif font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors text-on-surface">{book.title}</h3>
        <p className="text-xs text-secondary line-clamp-1 mb-2">{book.authors}</p>
      </div>
    </Link>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [headline, setHeadline] = useState("");
  const [isHeadlineVisible, setIsHeadlineVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { user, logout } = useAuth();
  const searchResultsRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  useEffect(() => {
    // Fetch initial books for the carousel
    const fetchBooks = async () => {
      try {
        const res = await fetch(`${API_URL}/books?limit=15`);
        if (res.ok) {
          const data = await res.json();
          // Duplicate the books array to ensure infinite scrolling looks seamless
          setBooks([...data, ...data]);
        }
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    };

    fetchBooks();
  }, [API_URL]);

  useEffect(() => {
    // Select a random quote on client mount
    const randomQuote = readingQuotes[Math.floor(Math.random() * readingQuotes.length)];
    setHeadline(randomQuote);
    
    // Trigger animation slightly after mount
    const timer = setTimeout(() => {
      setIsHeadlineVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`${API_URL}/books?search=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
        setTimeout(() => {
          searchResultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 w-full bg-background text-on-background font-sans selection:bg-primary/30 flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 sm:px-12 flex justify-between items-center sticky top-0 z-50 border-b border-stone-200 bg-[#f5fbf5]/90 backdrop-blur-md">
        <div className="flex items-center gap-2 text-primary">
          <Library className="w-6 h-6" />
          <span className="font-serif font-bold text-xl tracking-tight text-on-surface">Cozy Library</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-on-surface">Hello, {user.name.split(' ')[0]}</span>
              <Link href="/collection" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                My Collection
              </Link>
              <button 
                onClick={() => logout()}
                className="text-sm font-medium text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-secondary hover:text-primary transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="text-sm font-medium bg-primary text-white px-5 py-2 rounded-full hover:bg-primary/90 transition-colors shadow-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative flex-1 flex flex-col justify-center items-center text-center px-6 sm:px-12 pt-16 pb-12 z-10">
        <p className="text-sm font-semibold tracking-widest text-primary uppercase mb-6">Welcome to Cozy Library</p>
        
        <h1 
          className={`font-serif text-4xl sm:text-5xl md:text-[56px] font-semibold leading-[1.15] tracking-[-0.02em] max-w-4xl mx-auto mb-8 text-on-surface transition-all duration-700 ease-out transform ${
            isHeadlineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          "{headline}"
        </h1>
        
        <p className="text-lg text-secondary max-w-2xl mx-auto mb-10">
          Build your personalized collection and discover stories that perfectly match your taste.
        </p>

        <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto flex items-center gap-3 mb-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (!e.target.value) setSearchResults(null);
            }}
            placeholder="Search for books by title..."
            className="flex-1 min-w-0 bg-surface px-5 py-3 rounded-full border border-stone-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-md text-on-surface"
          />
          <button type="submit" disabled={isSearching} className="shrink-0 bg-primary text-white px-7 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 shadow-md">
            {isSearching ? "Searching..." : "Search"}
          </button>
        </form>

        {!user && (
          <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-on-surface text-surface px-8 py-4 rounded-full font-medium text-lg hover:scale-105 transition-transform shadow-md">
            Start Exploring
          </Link>
        )}
      </section>

      {/* Cover Image Section */}
      <div className="w-[95%] h-[600px] mb-5 mx-auto flex justify-center relative rounded-lg overflow-hidden shadow-lg">
        <img src="/cover.png" alt="Cover" className="w-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-linear-to-t from-[#d4d4d4] via-[#d4d4d4]/20 to-transparent pointer-events-none" />
      </div>

      {/* Dynamic Content Section: Search Results OR Infinite Carousel */}
      {searchResults ? (
        <section ref={searchResultsRef} className="pb-24 w-full max-w-7xl mx-auto px-6 sm:px-12 scroll-mt-20">
          <h2 className="font-serif text-2xl font-semibold mb-6 text-on-surface flex items-center justify-between">
            <span>Search Results</span>
            <button 
              onClick={() => {
                setSearchQuery("");
                setSearchResults(null);
              }}
              className="text-sm font-sans text-secondary hover:text-primary transition-colors"
            >
              Clear Search
            </button>
          </h2>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {searchResults.map((book) => (
                <BookCard key={book.book_id} book={book} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-secondary bg-surface rounded-xl border border-stone-100">
              No books found matching "{searchQuery}".
            </div>
          )}
        </section>
      ) : (
        <section className="pb-24 w-full relative group">
          <div className="absolute inset-y-0 left-0 w-32 bg-linear-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-32 bg-linear-to-l from-background to-transparent z-10 pointer-events-none" />
          
          {/* CSS Marquee Animation Container */}
          <div className="flex overflow-hidden relative w-full py-8">
            <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] min-w-max">
              {books.map((book, index) => (
                <BookCard key={`${book.book_id}-${index}`} book={book} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="w-full bg-[#eff5ef] py-36 px-6 sm:px-12 mt-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-center text-on-surface mb-16">
            A smarter way to discover books
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-on-surface mb-3">AI-Powered Summaries</h3>
              <p className="text-secondary leading-relaxed">
                Instant, editorial-grade insights generated on demand by Llama 3.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <BrainCircuit className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-on-surface mb-3">Machine Learning Matches</h3>
              <p className="text-secondary leading-relaxed">
                Advanced cosine-similarity algorithms find books that truly match your taste.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
                <Library className="w-7 h-7" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-on-surface mb-3">Personal Sanctuary</h3>
              <p className="text-secondary leading-relaxed">
                Curate your own collection and rate your favorite reads in a distraction-free environment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Editorial Footer */}
      <footer className="w-full bg-[#f5fbf5] border-t border-stone-200 pt-16 pb-10 px-6 sm:px-12 mt-auto">
        <div className="max-w-5xl mx-auto">

          {/* Top Row: Logo + Quote LEFT | Links RIGHT */}
          <div className="flex flex-row justify-between items-start gap-8 mb-10">

            {/* Left: Logo & Quote — nowrap logo, constrained quote */}
            <div className="flex flex-col gap-4 min-w-0">
              <div className="flex items-center gap-2.5 text-primary hover:scale-105 transition-transform duration-300 shrink-0">
                <Library className="w-7 h-7 shrink-0" />
                <span className="font-serif font-bold text-2xl tracking-tight text-on-surface whitespace-nowrap">
                  Cozy Library
                </span>
              </div>

              <div className="max-w-full">
                <p className="text-secondary/90 font-serif italic text-base leading-relaxed">
                  "There is no friend as loyal as a book."
                </p>
                <span className="text-xs font-sans text-stone-400 tracking-widest left-4 uppercase mt-2 block">
                  — Ernest Hemingway
                </span>
              </div>
            </div>

            {/* Right: Links */}
            <div className="flex flex-col items-end gap-4 text-sm font-medium text-stone-500 shrink-0 pt-1">
              <Link href="/" className="hover:text-primary transition-colors">
                Discovery
              </Link>
              <Link href="/collection" className="hover:text-primary transition-colors">
                My Collection
              </Link>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="hover:text-primary transition-colors cursor-pointer flex items-center gap-1"
              >
                Back to Top ↑
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-linear-to-r from-transparent via-primary/65 to-transparent mb-8" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-stone-400 gap-3">
            <p>&copy; {new Date().getFullYear()} Swayam Singh</p>
            <p className="flex items-center gap-1.5">
              Curated with <Sparkles className="w-3.5 h-3.5 text-primary" />
            </p>
          </div>

        </div>
      </footer>

      {/* Global CSS for Marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 80s linear infinite;
        }
      `}} />
    </div>
  );
}