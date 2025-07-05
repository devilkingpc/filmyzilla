'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from 'next/link';

interface MovieLink {
  title: string;
  url: string;
  quality: string;
}

interface CategoryData {
  category: string;
  categoryUrl: string;
  movies: MovieLink[];
}

interface FlatMovie extends MovieLink {
  category: string;
  categoryUrl: string;
}

export default function Home() {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flatMovies, setFlatMovies] = useState<FlatMovie[]>([]);
  const [categoriesWithoutMovies, setCategoriesWithoutMovies] = useState<CategoryData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/movies');
        const result = await response.json();
        
        if (result.success) {
          setData(result.data);
          
          // Separate categories with movies and without movies
          const categoriesWithMovies = result.data.filter((category: CategoryData) => category.movies.length > 0);
          const categoriesWithoutMoviesData = result.data.filter((category: CategoryData) => category.movies.length === 0);
          
          setCategoriesWithoutMovies(categoriesWithoutMoviesData);
          
          // Flatten the data for categories that have movies
          const flattened = categoriesWithMovies.flatMap((category: CategoryData) =>
            category.movies.map((movie: MovieLink) => ({
              ...movie,
              category: category.category,
              categoryUrl: category.categoryUrl
            }))
          );
          setFlatMovies(flattened);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading FilmyZilla data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-3 sm:p-4 lg:p-6 xl:p-8 space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">
            FilmyZilla Movies
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground">
            Latest Bollywood & Hollywood Movies
          </p>
          <div className="flex justify-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <span>Movies: {flatMovies.length}</span>
            <span>Categories: {categoriesWithoutMovies.length}</span>
          </div>
        </div>

        {/* Movies Table */}
        <Card className="w-full overflow-hidden">
          <CardHeader className="p-3 sm:p-4 lg:p-6">
            <CardTitle className="text-base sm:text-lg lg:text-xl">All Movies</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Complete list of all available movies
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] xl:w-[45%]">Movie Title</TableHead>
                    <TableHead className="w-[20%]">Category</TableHead>
                    <TableHead className="w-[15%]">Quality</TableHead>
                    <TableHead className="w-[25%] xl:w-[20%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatMovies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                        No movies available at the moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    flatMovies.map((movie, index) => (
                      <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium p-3 xl:p-4">
                          <span className="text-sm xl:text-base">{movie.title}</span>
                        </TableCell>
                        <TableCell className="p-3 xl:p-4">
                          <Link 
                            href={`/category${new URL(movie.categoryUrl).pathname.replace('/category/', '/')}`}
                            className="text-primary hover:underline text-xs xl:text-sm transition-colors"
                          >
                            {movie.category}
                          </Link>
                        </TableCell>
                        <TableCell className="p-3 xl:p-4">
                          <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs xl:text-sm font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                            {movie.quality}
                          </span>
                        </TableCell>
                        <TableCell className="p-3 xl:p-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs xl:text-sm"
                            asChild
                          >
                            <Link href={`/movie${new URL(movie.url).pathname.replace('/movies/', '/')}`}>
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Tablet Table */}
            <div className="hidden md:block lg:hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50%]">Movie Title</TableHead>
                    <TableHead className="w-[20%]">Quality</TableHead>
                    <TableHead className="w-[30%]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flatMovies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                        No movies available at the moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    flatMovies.map((movie, index) => (
                      <TableRow key={index} className="hover:bg-muted/50 transition-colors">
                        <TableCell className="font-medium p-3">
                          <div className="space-y-1">
                            <span className="text-sm font-semibold">{movie.title}</span>
                            <div>
                              <Link 
                                href={`/category${new URL(movie.categoryUrl).pathname.replace('/category/', '/')}`}
                                className="text-primary hover:underline text-xs transition-colors"
                              >
                                {movie.category}
                              </Link>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="p-3">
                          <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20">
                            {movie.quality}
                          </span>
                        </TableCell>
                        <TableCell className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs"
                            asChild
                          >
                            <Link href={`/movie${new URL(movie.url).pathname.replace('/movies/', '/')}`}>
                              View Details
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card Layout */}
            <div className="md:hidden space-y-3 p-3 sm:p-4">
              {flatMovies.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="text-sm">No movies available at the moment</p>
                </div>
              ) : (
                flatMovies.map((movie, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-3 sm:p-4">
                      <div className="space-y-3">
                        <h3 className="font-semibold text-sm sm:text-base leading-tight break-words">
                          {movie.title}
                        </h3>
                        <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                          <Link 
                            href={`/category${new URL(movie.categoryUrl).pathname.replace('/category/', '/')}`}
                            className="text-primary hover:underline text-xs sm:text-sm transition-colors"
                          >
                            {movie.category}
                          </Link>
                          <span className="inline-flex items-center rounded-full bg-green-50 dark:bg-green-900/20 px-2 py-1 text-xs font-medium text-green-700 dark:text-green-400 ring-1 ring-inset ring-green-600/20 w-fit">
                            {movie.quality}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs sm:text-sm"
                          asChild
                        >
                          <Link href={`/movie${new URL(movie.url).pathname.replace('/movies/', '/')}`}>
                            View Details
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Categories without movies - Moved to bottom */}
        {categoriesWithoutMovies.length > 0 && (
          <Card className="w-full">
            <CardHeader className="p-3 sm:p-4 lg:p-6">
              <CardTitle className="text-base sm:text-lg lg:text-xl">Special Categories</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Additional movie categories and collections
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-3">
                {categoriesWithoutMovies.map((category, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-auto p-3 sm:p-4 justify-start text-left hover:bg-accent/50 transition-colors"
                    asChild
                  >
                    <Link 
                      href={`/category${new URL(category.categoryUrl).pathname.replace('/category/', '/')}`}
                      className="block w-full"
                    >
                      <span className="text-xs sm:text-sm font-medium break-words leading-tight">
                        {category.category}
                      </span>
                    </Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center pt-4 sm:pt-6 lg:pt-8">
          <p className="text-muted-foreground text-xs sm:text-sm">
            Data scraped from FilmyZilla • Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
