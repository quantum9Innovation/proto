// Locale select
// The initial screen shown on first app startup
// Used to determine user locale preferences

import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_l10n.dart';

class Locale extends StatelessWidget {
  const Locale({Key? key}) : super(key: key);

  // Locale root
  @override
  Widget build(BuildContext context) {
    final appLocale = Localizations.localeOf(context).toString();
    final lang = appLocale.split('_')[0];
    final locales = {
      'en_US': {
        'name': 'English',
        'country': 'United States',
      },
      'es_MX': {
        'name': 'Español',
        'country': 'México',
      }
    };

    return Scaffold(
        appBar: AppBar(
          elevation: 2,
          title: Text(AppLocalizations.of(context)!.helloWorld),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                AppLocalizations.of(context)!.main,
              ),
            ],
          ),
        ),
        floatingActionButton: FloatingActionButton(
            onPressed: () => {}, child: const Icon(Icons.add)));
  }
}
