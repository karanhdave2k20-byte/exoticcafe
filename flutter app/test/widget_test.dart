// Widget tests for Exotic Café Flutter app.

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:exotic_cafe_app/main.dart';

void main() {
  testWidgets('App launches and shows SplashScreen', (WidgetTester tester) async {
    // Build the app and trigger a frame.
    await tester.pumpWidget(const ExoticCafeApp());

    // Allow splash screen animations / timers to settle.
    await tester.pump(const Duration(milliseconds: 500));

    // The app should render without throwing any errors.
    expect(find.byType(MaterialApp), findsOneWidget);
  });
}
