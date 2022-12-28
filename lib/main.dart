import 'package:flutter/material.dart';
import "sample.dart"; //sample random app

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Proto',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        appBarTheme: const AppBarTheme(
          backgroundColor: Color(0xFFFF8200),
          foregroundColor: Color(0xFFE6FFF9),
        ),
      ),
      home: const RandomWords(), // And add the const back here.
    );
  }
}
