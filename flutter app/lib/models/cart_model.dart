class CartModel {
  final List<Map<String, dynamic>> _items = [];

  List<Map<String, dynamic>> get items => List.unmodifiable(_items);

  int get itemCount => _items.fold(0, (sum, item) => sum + (item['qty'] as int));

  double get total => _items.fold(
        0,
        (sum, item) => sum + (item['price'] as double) * (item['qty'] as int),
      );

  void addItem(Map<String, dynamic> item) {
    final index = _items.indexWhere((i) => i['name'] == item['name']);
    if (index >= 0) {
      _items[index]['qty'] = (_items[index]['qty'] as int) + 1;
    } else {
      _items.add({...item, 'qty': 1});
    }
  }

  void removeItem(String name) {
    final index = _items.indexWhere((i) => i['name'] == name);
    if (index >= 0) {
      if ((_items[index]['qty'] as int) > 1) {
        _items[index]['qty'] = (_items[index]['qty'] as int) - 1;
      } else {
        _items.removeAt(index);
      }
    }
  }

  void clear() => _items.clear();
}
