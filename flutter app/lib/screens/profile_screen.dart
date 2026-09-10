import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        title: Text(
          'My Profile',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFD4A853),
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Avatar
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFD4A853).withValues(alpha: 0.2),
                border: Border.all(color: const Color(0xFFD4A853), width: 2),
              ),
              child: const Icon(Icons.person, size: 50, color: Color(0xFFD4A853)),
            ),
            const SizedBox(height: 12),
            Text(
              'Welcome, Guest!',
              style: GoogleFonts.playfairDisplay(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            Text(
              'TableHive Member',
              style: GoogleFonts.lato(color: Colors.white38, fontSize: 13),
            ),
            const SizedBox(height: 30),
            // Stats row
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                _statCard('12', 'Orders'),
                _statCard('4.8', 'Rating'),
                _statCard('₹2.4k', 'Spent'),
              ],
            ),
            const SizedBox(height: 28),
            // Menu items
            _menuTile(Icons.receipt_long, 'My Orders', 'View order history'),
            _menuTile(Icons.favorite_outline, 'Favourites', 'Your saved items'),
            _menuTile(Icons.location_on_outlined, 'Address', 'Manage addresses'),
            _menuTile(Icons.notifications_outlined, 'Notifications', 'App notifications'),
            _menuTile(Icons.help_outline, 'Help & Support', 'FAQ and contact'),
            _menuTile(Icons.info_outline, 'About', 'About TableHive'),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1A0A00),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFD4A853).withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.local_cafe, color: Color(0xFFD4A853)),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Loyalty Points: 240',
                            style: GoogleFonts.playfairDisplay(
                                color: const Color(0xFFD4A853),
                                fontWeight: FontWeight.bold)),
                        Text('Earn 1 point per ₹10 spent',
                            style: GoogleFonts.lato(color: Colors.white38, fontSize: 12)),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String value, String label) {
    return Container(
      width: 90,
      padding: const EdgeInsets.symmetric(vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        children: [
          Text(value,
              style: GoogleFonts.playfairDisplay(
                  color: const Color(0xFFD4A853),
                  fontSize: 20,
                  fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text(label,
              style: GoogleFonts.lato(color: Colors.white38, fontSize: 12)),
        ],
      ),
    );
  }

  Widget _menuTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        borderRadius: BorderRadius.circular(14),
      ),
      child: ListTile(
        leading: Icon(icon, color: const Color(0xFFD4A853)),
        title: Text(title,
            style: GoogleFonts.lato(color: Colors.white, fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle,
            style: GoogleFonts.lato(color: Colors.white38, fontSize: 12)),
        trailing: const Icon(Icons.chevron_right, color: Colors.white24),
        onTap: () {},
      ),
    );
  }
}
