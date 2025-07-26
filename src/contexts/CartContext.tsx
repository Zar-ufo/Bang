import React, { createContext, useContext, useEffect, useState } from 'react'
import { CartItem, Product, supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => Promise<void>
  removeFromCart: (productId: string) => Promise<void>
  updateQuantity: (productId: string, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  getCartTotal: () => number
  getCartItemsCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      fetchCartItems()
    } else {
      setCartItems([])
    }
  }, [user])

  const fetchCartItems = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*)
      `)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error fetching cart items:', error)
      return
    }

    setCartItems(data || [])
  }

  const addToCart = async (product: Product, quantity: number = 1) => {
    if (!user) return

    const existingItem = cartItems.find(item => item.product_id === product.id)

    if (existingItem) {
      await updateQuantity(product.id, existingItem.quantity + quantity)
    } else {
      const { data, error } = await supabase
        .from('cart_items')
        .insert({
          user_id: user.id,
          product_id: product.id,
          quantity,
        })
        .select(`
          *,
          product:products(*)
        `)
        .single()

      if (error) {
        console.error('Error adding to cart:', error)
        return
      }

      setCartItems(prev => [...prev, data])
    }
  }

  const removeFromCart = async (productId: string) => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)
      .eq('product_id', productId)

    if (error) {
      console.error('Error removing from cart:', error)
      return
    }

    setCartItems(prev => prev.filter(item => item.product_id !== productId))
  }

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user || quantity < 1) return

    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', user.id)
      .eq('product_id', productId)
      .select(`
        *,
        product:products(*)
      `)
      .single()

    if (error) {
      console.error('Error updating quantity:', error)
      return
    }

    setCartItems(prev =>
      prev.map(item =>
        item.product_id === productId ? data : item
      )
    )
  }

  const clearCart = async () => {
    if (!user) return

    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id)

    if (error) {
      console.error('Error clearing cart:', error)
      return
    }

    setCartItems([])
  }

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product?.price || 0) * item.quantity
    }, 0)
  }

  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemsCount,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}