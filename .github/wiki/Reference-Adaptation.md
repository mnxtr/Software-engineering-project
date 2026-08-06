# Reference Adaptation

## Decision

NSU Companion remains a campus cafeteria and pre-ordering system. The [COVID-19 Help Service Application](https://github.com/Abrar-Sultan/covid-19_help_service_application) is a design and organization reference, not a source to clone.

## Adaptation map

| Reference pattern | Adaptation in NSU Companion |
| --- | --- |
| Feature-oriented service modules | Separate authentication, menu, order, vendor, user, and admin routes |
| Searchable service listings | Search menu items by name, description, or category |
| Availability-led discovery | Show currently orderable items with category filters |
| Authentication-aware navigation | Display actions according to customer, vendor, or administrator role |
| Separate service workflows | Customer ordering, vendor fulfilment, and administrator oversight |

## Excluded from this project

- COVID-19, medicine, plasma, consultation, ICU, bed-reservation, and emergency-service concepts
- Django models, templates, views, URL configuration, or Python dependencies
- Medical, identity-document, or diagnostic information
- Reference branding, copy, images, data, and source code
- The committed virtual environment found in the reference repository

## Rule for future work

A referenced pattern is acceptable only when it is redesigned for cafeteria discovery, ordering, payment, fulfilment, or administration and implemented in the existing React, Express, and SQLite codebase.

For the detailed engineering note, see [docs/REFERENCE_ADAPTATION.md](https://github.com/mnxtr/Software-engineering-project/blob/main/docs/REFERENCE_ADAPTATION.md).
