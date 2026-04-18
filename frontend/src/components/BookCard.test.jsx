import React from 'react'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import BookCard from '../components/BookCard'

const mockBook = {
  id: 1,
  title: 'Test Book',
  authors: 'Test Author',
  price: 29.99,
  imageUrl: 'https://example.com/image.jpg'
}

describe('BookCard', () => {
  it('renders book information correctly', () => {
    render(
      <BrowserRouter>
        <BookCard book={mockBook} />
      </BrowserRouter>
    )

    expect(screen.getByText('Test Book')).toBeInTheDocument()
    expect(screen.getByText('Test Author')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
  })

  it('renders with link when to prop is provided', () => {
    render(
      <BrowserRouter>
        <BookCard book={mockBook} to="/product/1" />
      </BrowserRouter>
    )

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/product/1')
    expect(screen.getByText('View →')).toBeInTheDocument()
  })

  it('handles missing book data gracefully', () => {
    render(
      <BrowserRouter>
        <BookCard book={{}} />
      </BrowserRouter>
    )

      expect(screen.getByText('Untitled book')).toBeInTheDocument()
      expect(screen.getByText('Unknown author')).toBeInTheDocument()
    expect(screen.getByText('-')).toBeInTheDocument()
  })
})