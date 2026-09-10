import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'menu_screen.dart';
import 'cart_screen.dart';
import 'profile_screen.dart';
import '../models/cart_model.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;
  final CartModel _cart = CartModel();

  final List<Map<String, dynamic>> _categories = [
    {'icon': Icons.coffee, 'label': 'Coffee', 'color': Color(0xFF6F4E37)},
    {'icon': Icons.local_drink, 'label': 'Drinks', 'color': Color(0xFF1565C0)},
    {'icon': Icons.cake, 'label': 'Desserts', 'color': Color(0xFFAD1457)},
    {'icon': Icons.lunch_dining, 'label': 'Food', 'color': Color(0xFF2E7D32)},
    {'icon': Icons.breakfast_dining, 'label': 'Breakfast', 'color': Color(0xFFE65100)},
  ];

  final List<Map<String, dynamic>> _featuredItems = [
    {
      'name': 'Signature Espresso',
      'price': '₹180',
      'description': 'Rich, bold espresso with a velvety crema',
      'rating': 4.8,
      'icon': Icons.coffee,
      'color': Color(0xFF4E342E),
    },
    {
      'name': 'Exotic Cold Brew',
      'price': '₹220',
      'description': 'Slow-steeped perfection with chocolate notes',
      'rating': 4.9,
      'icon': Icons.local_drink,
      'color': Color(0xFF1A237E),
    },
    {
      'name': 'Belgian Waffle',
      'price': '₹280',
      'description': 'Crispy golden waffles with maple syrup',
      'rating': 4.7,
      'icon': Icons.breakfast_dining,
      'color': Color(0xFFBF360C),
    },
    {
      'name': 'Cheesecake Delight',
      'price': '₹320',
      'description': 'Creamy NY-style cheesecake with berry compote',
      'rating': 4.9,
      'icon': Icons.cake,
      'color': Color(0xFF6A1B9A),
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      bottomNavigationBar: _buildBottomNav(),
      body: IndexedStack(
        index: _currentIndex,
        children: [
          _buildHomeContent(),
          MenuScreen(cart: _cart),
          CartScreen(cart: _cart),
          ProfileScreen(),
        ],
      ),
    );
  }

  Widget _buildBottomNav() {
    return Container(
      decoration: BoxDecoration(
        color: const Color(0xFF1A1A1A),
        border: Border(
          top: BorderSide(color: const Color(0xFFD4A853).withValues(alpha: 0.3), width: 0.5),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
        backgroundColor: Colors.transparent,
        selectedItemColor: const Color(0xFFD4A853),
        unselectedItemColor: Colors.white38,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: GoogleFonts.lato(fontSize: 11, fontWeight: FontWeight.w600),
        unselectedLabelStyle: GoogleFonts.lato(fontSize: 11),
        items: [
          const BottomNavigationBarItem(icon: Icon(Icons.home_rounded), label: 'Home'),
          const BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu), label: 'Menu'),
          BottomNavigationBarItem(
            icon: Stack(
              children: [
                const Icon(Icons.shopping_cart_rounded),
                if (_cart.itemCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      width: 14,
                      height: 14,
                      decoration: const BoxDecoration(
                        color: Color(0xFFD4A853),
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: Text(
                          '${_cart.itemCount}',
                          style: const TextStyle(fontSize: 9, color: Colors.black, fontWeight: FontWeight.bold),
                        ),
                      ),
                    ),
                  ),
              ],
            ),
            label: 'Cart',
          ),
          const BottomNavigationBarItem(icon: Icon(Icons.person_rounded), label: 'Profile'),
        ],
      ),
    );
  }

  Widget _buildHomeContent() {
    return CustomScrollView(
      slivers: [
        _buildAppBar(),
        SliverToBoxAdapter(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildGreeting(),
                const SizedBox(height: 24),
                _buildSearchBar(),
                const SizedBox(height: 28),
                _buildSectionTitle('Categories'),
                const SizedBox(height: 16),
                _buildCategories(),
                const SizedBox(height: 28),
                _buildSectionTitle('Featured Items'),
                const SizedBox(height: 16),
                _buildFeaturedItems(),
                const SizedBox(height: 28),
                _buildSpecialBanner(),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      expandedHeight: 100,
      floating: false,
      pinned: true,
      backgroundColor: const Color(0xFF0D0D0D),
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                const Color(0xFF1A0A00),
                const Color(0xFF0D0D0D).withValues(alpha: 0),
              ],
            ),
          ),
        ),
        title: Text(
          'TableHive',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFD4A853),
            fontWeight: FontWeight.bold,
            fontSize: 22,
          ),
        ),
        centerTitle: false,
      ),
      actions: [
        IconButton(
          icon: const Icon(Icons.notifications_outlined, color: Colors.white70),
          onPressed: () {},
        ),
        IconButton(
          icon: const Icon(Icons.qr_code_scanner, color: Color(0xFFD4A853)),
          onPressed: () {},
        ),
      ],
    );
  }

  Widget _buildGreeting() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Good Evening! 👋',
          style: GoogleFonts.lato(color: Colors.white54, fontSize: 14),
        ),
        const SizedBox(height: 4),
        Text(
          'What would you like\ntoday?',
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontSize: 26,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }

  Widget _buildSearchBar() {
    return GestureDetector(
      onTap: () => setState(() => _currentIndex = 1),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white12),
        ),
        child: Row(
          children: [
            const Icon(Icons.search, color: Colors.white38, size: 20),
            const SizedBox(width: 12),
            Text(
              'Search menu, drinks, desserts...',
              style: GoogleFonts.lato(color: Colors.white38, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          title,
          style: GoogleFonts.playfairDisplay(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        TextButton(
          onPressed: () => setState(() => _currentIndex = 1),
          child: Text(
            'See all',
            style: GoogleFonts.lato(color: const Color(0xFFD4A853), fontSize: 13),
          ),
        ),
      ],
    );
  }

  Widget _buildCategories() {
    return SizedBox(
      height: 90,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _categories.length,
        separatorBuilder: (_, _) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final cat = _categories[index];
          return GestureDetector(
            onTap: () => setState(() => _currentIndex = 1),
            child: Column(
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: (cat['color'] as Color).withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: (cat['color'] as Color).withValues(alpha: 0.3)),
                  ),
                  child: Icon(cat['icon'] as IconData, color: cat['color'] as Color, size: 26),
                ),
                const SizedBox(height: 6),
                Text(
                  cat['label'] as String,
                  style: GoogleFonts.lato(color: Colors.white70, fontSize: 12),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildFeaturedItems() {
    return SizedBox(
      height: 210,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        itemCount: _featuredItems.length,
        separatorBuilder: (_, _) => const SizedBox(width: 14),
        itemBuilder: (context, index) {
          final item = _featuredItems[index];
          return Container(
            width: 170,
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A1A),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white10),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  height: 100,
                  decoration: BoxDecoration(
                    color: (item['color'] as Color).withValues(alpha: 0.2),
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                  ),
                  child: Center(
                    child: Icon(item['icon'] as IconData,
                        size: 48, color: item['color'] as Color),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['name'] as String,
                        style: GoogleFonts.playfairDisplay(
                            color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item['price'] as String,
                            style: GoogleFonts.lato(
                                color: const Color(0xFFD4A853),
                                fontSize: 15,
                                fontWeight: FontWeight.bold),
                          ),
                          Row(
                            children: [
                              const Icon(Icons.star, color: Color(0xFFD4A853), size: 12),
                              const SizedBox(width: 2),
                              Text(
                                '${item['rating']}',
                                style: GoogleFonts.lato(color: Colors.white54, fontSize: 11),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildSpecialBanner() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF4E2A00), Color(0xFF7A4100)],
        ),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Special Offer',
                  style: GoogleFonts.lato(
                    color: const Color(0xFFD4A853),
                    fontSize: 13,
                    letterSpacing: 2,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  '20% OFF on\nAll Coffees',
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                ElevatedButton(
                  onPressed: () => setState(() => _currentIndex = 1),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFD4A853),
                    foregroundColor: Colors.black,
                    padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: Text(
                    'Order Now',
                    style: GoogleFonts.lato(fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                ),
              ],
            ),
          ),
          const Icon(Icons.local_cafe, size: 80, color: Color(0xFFD4A853)),
        ],
      ),
    );
  }
}
