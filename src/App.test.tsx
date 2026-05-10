import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const linkElement = screen.getByText(/Assistant CIQUAL/i);
  expect(linkElement).toBeInTheDocument();
});

test('can search and add food', () => {
  render(<App />);
  const searchInput = screen.getByPlaceholderText(/Chercher un aliment/i);
  
  fireEvent.change(searchInput, { target: { value: 'baguette' } });
  
  const addButton = screen.getAllByRole('button', { name: /Ajouter/i })[0]; 
  fireEvent.click(addButton);
  
  // Vérifier qu'il y a au moins un élément "Pain blanc"
  const items = screen.getAllByText(/Pain blanc/i);
  expect(items.length).toBeGreaterThanOrEqual(1);
  
  // Vérifier la valeur calorique (287)
  const kcalValue = screen.getAllByText(/287/i);
  expect(kcalValue.length).toBeGreaterThanOrEqual(1);
});
