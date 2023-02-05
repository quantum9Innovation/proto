import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_l10n.dart';

class Home extends StatelessWidget {
  const Home({Key? key}) : super(key: key);

  // This widget is the root of your application.
  @override
  Widget build(BuildContext context) {
    return Scaffold(
        appBar: AppBar(
          elevation: 2,
          title: Text(AppLocalizations.of(context)!.helloWorld),
        ),
        // body: Center(
        //   child: Column(
        //     mainAxisAlignment: MainAxisAlignment.center,
        //     children: const [
        //       Text(
        //         'Update with your UI',
        //       ),
        //     ],
        //   ),
        // ),
        floatingActionButton: FloatingActionButton(
            onPressed: () => {},
            tooltip: 'Increment',
            child: const Icon(Icons.add)));
  }
}
