// Locale select
// The initial screen shown on first app startup
// Used to determine user locale preferences

import 'type.g.dart';
import 'package:flutter/material.dart';
import 'package:flutter_gen/gen_l10n/app_l10n.dart';

class Search extends StatefulWidget {
  const Search({Key? key}) : super(key: key);

  @override
  State<Search> createState() => _SearchState();
}

class _SearchState extends State<Search> {
  @override
  Widget build(BuildContext context) {
    return const TextField(
      decoration: InputDecoration(
        border: OutlineInputBorder(),
        labelText: 'Search for a language',
        prefixIcon: Padding(
            padding: EdgeInsets.only(left: 16, right: 16),
            child: Icon(Icons.search)),
      ),
    );
  }
}

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
      },
    };

    return Scaffold(
      body: Padding(
          padding: const EdgeInsets.only(left: 100, top: 100),
          child:
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            SizedBox(
                height: 100,
                child: Text(AppLocalizations.of(context)!.locale_title,
                    style: latinFonts['display'])),
            Container(
              padding: const EdgeInsets.only(left: 0, top: 45),
              width: 800,
              child: const Search(),
            ),
          ])),
    );
  }
}
