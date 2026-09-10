import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/cart_model.dart';

class CartScreen extends StatefulWidget {
  final CartModel cart;
  const CartScreen({super.key, required this.cart});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  @override
  Widget build(BuildContext context) {
    final items = widget.cart.items;
    final total = widget.cart.total;

    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        title: Text(
          'Your Cart',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFD4A853),
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          if (items.isNotEmpty)
            TextButton(
              onPressed: () {
                setState(() => widget.cart.clear());
              },
              child: Text(
                'Clear',
                style: GoogleFonts.lato(color: Colors.red.shade400),
              ),
            ),
        ],
      ),
      body: items.isEmpty
          ? _buildEmptyCart()
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(16),
                    itemCount: items.length,
                    itemBuilder: (context, index) => _buildCartItem(items[index]),
                  ),
                ),
                _buildCheckoutPanel(total),
              ],
            ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_cart_outlined, size: 80, color: Colors.white12),
          const SizedBox(height: 16),
          Text(
            'Your cart is empty',
            style: GoogleFonts.playfairDisplay(color: Colors.white38, fontSize: 20),
          ),
          const SizedBox(height: 8),
          Text(
            'Add items from the menu',
            style: GoogleFonts.lato(color: Colors.white24, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          Container(
            width: 52,
            height: 52,
            decoration: BoxDecoration(
              color: (item['color'] as Color).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 26),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'] as String,
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white, fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  '₹${(item['price'] as double).toInt()} each',
                  style: GoogleFonts.lato(color: Colors.white38, fontSize: 12),
                ),
              ],
            ),
          ),
          Row(
            children: [
              GestureDetector(
                onTap: () => setState(() => widget.cart.removeItem(item['name'] as String)),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: Colors.white10,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.remove, color: Colors.white, size: 16),
                ),
              ),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: Text(
                  '${item['qty']}',
                  style: GoogleFonts.lato(
                    color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
              GestureDetector(
                onTap: () => setState(() => widget.cart.addItem(item)),
                child: Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: const Color(0xFFD4A853),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Icon(Icons.add, color: Colors.black, size: 16),
                ),
              ),
            ],
          ),
          const SizedBox(width: 12),
          Text(
            '₹${((item['price'] as double) * (item['qty'] as int)).toInt()}',
            style: GoogleFonts.lato(
              color: const Color(0xFFD4A853), fontWeight: FontWeight.bold, fontSize: 15),
          ),
        ],
      ),
    );
  }

  Widget _buildCheckoutPanel(double total) {
    final tax = total * 0.05;
    final grandTotal = total + tax;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(top: BorderSide(color: Colors.white12)),
      ),
      child: Column(
        children: [
          _priceRow('Subtotal', '₹${total.toInt()}'),
          const SizedBox(height: 6),
          _priceRow('GST (5%)', '₹${tax.toInt()}'),
          const Divider(color: Colors.white12, height: 20),
          _priceRow('Total', '₹${grandTotal.toInt()}', isTotal: true),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: () => _showOrderConfirmation(grandTotal),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFFD4A853),
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: Text(
                'Place Order · ₹${grandTotal.toInt()}',
                style: GoogleFonts.lato(fontWeight: FontWeight.bold, fontSize: 16),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _priceRow(String label, String value, {bool isTotal = false}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: GoogleFonts.lato(
            color: isTotal ? Colors.white : Colors.white54,
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
          ),
        ),
        Text(
          value,
          style: GoogleFonts.lato(
            color: isTotal ? const Color(0xFFD4A853) : Colors.white54,
            fontSize: isTotal ? 18 : 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  void _showOrderConfirmation(double total) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFF1A1A1A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          '🎉 Order Placed!',
          style: GoogleFonts.playfairDisplay(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        content: Text(
          'Your order of ₹${total.toInt()} has been placed. It will be ready in 15-20 minutes.',
          style: GoogleFonts.lato(color: Colors.white70),
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              setState(() => widget.cart.clear());
              Navigator.pop(ctx);
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFFD4A853)),
            child: Text('Great!', style: GoogleFonts.lato(color: Colors.black, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }
}
