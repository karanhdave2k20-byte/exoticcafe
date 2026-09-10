import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/cart_model.dart';

class MenuScreen extends StatefulWidget {
  final CartModel cart;
  const MenuScreen({super.key, required this.cart});

  @override
  State<MenuScreen> createState() => _MenuScreenState();
}

class _MenuScreenState extends State<MenuScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String _search = '';

  final List<String> _tabs = ['All', 'Coffee', 'Drinks', 'Food', 'Desserts', 'Breakfast'];

  final List<Map<String, dynamic>> _menuItems = [
    // Coffee
    {'name': 'Espresso', 'price': 180.0, 'category': 'Coffee', 'desc': 'Rich bold espresso shot', 'icon': Icons.coffee, 'color': Color(0xFF4E342E), 'rating': 4.8},
    {'name': 'Cappuccino', 'price': 220.0, 'category': 'Coffee', 'desc': 'Espresso with steamed milk foam', 'icon': Icons.coffee, 'color': Color(0xFF5D4037), 'rating': 4.9},
    {'name': 'Latte', 'price': 240.0, 'category': 'Coffee', 'desc': 'Smooth espresso with velvety milk', 'icon': Icons.local_cafe, 'color': Color(0xFF6D4C41), 'rating': 4.7},
    {'name': 'Americano', 'price': 190.0, 'category': 'Coffee', 'desc': 'Espresso diluted with hot water', 'icon': Icons.coffee, 'color': Color(0xFF3E2723), 'rating': 4.6},
    {'name': 'Cold Brew', 'price': 260.0, 'category': 'Coffee', 'desc': 'Slow-steeped cold coffee', 'icon': Icons.local_drink, 'color': Color(0xFF1A237E), 'rating': 4.9},
    // Drinks
    {'name': 'Mango Lassi', 'price': 180.0, 'category': 'Drinks', 'desc': 'Fresh mango blended with yogurt', 'icon': Icons.local_bar, 'color': Color(0xFFE65100), 'rating': 4.7},
    {'name': 'Fresh Lime Soda', 'price': 120.0, 'category': 'Drinks', 'desc': 'Refreshing lime with soda', 'icon': Icons.local_drink, 'color': Color(0xFF1B5E20), 'rating': 4.5},
    {'name': 'Watermelon Juice', 'price': 150.0, 'category': 'Drinks', 'desc': 'Cold pressed watermelon', 'icon': Icons.local_drink, 'color': Color(0xFFC62828), 'rating': 4.6},
    {'name': 'Iced Tea', 'price': 140.0, 'category': 'Drinks', 'desc': 'Chilled tea with lemon', 'icon': Icons.local_drink, 'color': Color(0xFF4527A0), 'rating': 4.4},
    // Food
    {'name': 'Veg Sandwich', 'price': 180.0, 'category': 'Food', 'desc': 'Grilled veggies in toasted bread', 'icon': Icons.lunch_dining, 'color': Color(0xFF2E7D32), 'rating': 4.5},
    {'name': 'Chicken Burger', 'price': 280.0, 'category': 'Food', 'desc': 'Juicy chicken patty burger', 'icon': Icons.lunch_dining, 'color': Color(0xFFBF360C), 'rating': 4.7},
    {'name': 'Pasta Arrabbiata', 'price': 320.0, 'category': 'Food', 'desc': 'Spicy tomato sauce pasta', 'icon': Icons.restaurant, 'color': Color(0xFFB71C1C), 'rating': 4.6},
    {'name': 'Caesar Salad', 'price': 240.0, 'category': 'Food', 'desc': 'Fresh romaine with caesar dressing', 'icon': Icons.eco, 'color': Color(0xFF1B5E20), 'rating': 4.4},
    // Desserts
    {'name': 'Cheesecake', 'price': 320.0, 'category': 'Desserts', 'desc': 'NY-style with berry compote', 'icon': Icons.cake, 'color': Color(0xFF6A1B9A), 'rating': 4.9},
    {'name': 'Chocolate Brownie', 'price': 180.0, 'category': 'Desserts', 'desc': 'Fudgy dark chocolate brownie', 'icon': Icons.cake, 'color': Color(0xFF3E2723), 'rating': 4.8},
    {'name': 'Tiramisu', 'price': 280.0, 'category': 'Desserts', 'desc': 'Italian espresso dessert', 'icon': Icons.cake, 'color': Color(0xFF4E342E), 'rating': 4.9},
    {'name': 'Ice Cream Sundae', 'price': 220.0, 'category': 'Desserts', 'desc': 'Scoops with hot fudge', 'icon': Icons.icecream, 'color': Color(0xFFAD1457), 'rating': 4.7},
    // Breakfast
    {'name': 'Belgian Waffle', 'price': 280.0, 'category': 'Breakfast', 'desc': 'Crispy golden waffles', 'icon': Icons.breakfast_dining, 'color': Color(0xFFBF360C), 'rating': 4.7},
    {'name': 'Pancake Stack', 'price': 240.0, 'category': 'Breakfast', 'desc': 'Fluffy pancakes with maple syrup', 'icon': Icons.breakfast_dining, 'color': Color(0xFFE65100), 'rating': 4.8},
    {'name': 'Eggs Benedict', 'price': 320.0, 'category': 'Breakfast', 'desc': 'Poached eggs with hollandaise', 'icon': Icons.egg, 'color': Color(0xFFF57F17), 'rating': 4.6},
    {'name': 'Avocado Toast', 'price': 260.0, 'category': 'Breakfast', 'desc': 'Smashed avocado on sourdough', 'icon': Icons.eco, 'color': Color(0xFF33691E), 'rating': 4.7},
  ];

  List<Map<String, dynamic>> get _filtered {
    final tab = _tabs[_tabController.index];
    return _menuItems.where((item) {
      final matchesCategory = tab == 'All' || item['category'] == tab;
      final matchesSearch = _search.isEmpty ||
          (item['name'] as String).toLowerCase().contains(_search.toLowerCase());
      return matchesCategory && matchesSearch;
    }).toList();
  }

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _tabController.addListener(() => setState(() {}));
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0D0D0D),
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        title: Text(
          'Our Menu',
          style: GoogleFonts.playfairDisplay(
            color: const Color(0xFFD4A853),
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(100),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: TextField(
                  onChanged: (v) => setState(() => _search = v),
                  style: GoogleFonts.lato(color: Colors.white),
                  decoration: InputDecoration(
                    hintText: 'Search items...',
                    hintStyle: GoogleFonts.lato(color: Colors.white38),
                    prefixIcon: const Icon(Icons.search, color: Colors.white38),
                    filled: true,
                    fillColor: const Color(0xFF1A1A1A),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide.none,
                    ),
                    contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
              ),
              TabBar(
                controller: _tabController,
                isScrollable: true,
                labelColor: const Color(0xFFD4A853),
                unselectedLabelColor: Colors.white38,
                indicatorColor: const Color(0xFFD4A853),
                labelStyle: GoogleFonts.lato(fontWeight: FontWeight.bold),
                tabs: _tabs.map((t) => Tab(text: t)).toList(),
              ),
            ],
          ),
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: _filtered.length,
        itemBuilder: (context, index) => _buildMenuItem(_filtered[index]),
      ),
    );
  }

  Widget _buildMenuItem(Map<String, dynamic> item) {
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
            width: 64,
            height: 64,
            decoration: BoxDecoration(
              color: (item['color'] as Color).withValues(alpha: 0.2),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(item['icon'] as IconData, color: item['color'] as Color, size: 32),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item['name'] as String,
                  style: GoogleFonts.playfairDisplay(
                    color: Colors.white,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  item['desc'] as String,
                  style: GoogleFonts.lato(color: Colors.white38, fontSize: 12),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    const Icon(Icons.star, color: Color(0xFFD4A853), size: 13),
                    const SizedBox(width: 3),
                    Text(
                      '${item['rating']}',
                      style: GoogleFonts.lato(color: Colors.white54, fontSize: 12),
                    ),
                    const SizedBox(width: 12),
                    Text(
                      '₹${(item['price'] as double).toInt()}',
                      style: GoogleFonts.lato(
                        color: const Color(0xFFD4A853),
                        fontWeight: FontWeight.bold,
                        fontSize: 15,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          GestureDetector(
            onTap: () {
              setState(() => widget.cart.addItem(item));
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('${item['name']} added to cart!',
                      style: GoogleFonts.lato()),
                  backgroundColor: const Color(0xFFD4A853),
                  behavior: SnackBarBehavior.floating,
                  duration: const Duration(seconds: 1),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                ),
              );
            },
            child: Container(
              width: 36,
              height: 36,
              decoration: const BoxDecoration(
                color: Color(0xFFD4A853),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.add, color: Colors.black, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
