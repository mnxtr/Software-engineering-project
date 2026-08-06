# Reference adaptation

## Purpose

This project remains **NSU Companion**, a smart cafeteria and pre-ordering system for North South University. The repository [Abrar-Sultan/covid-19_help_service_application](https://github.com/Abrar-Sultan/covid-19_help_service_application) was reviewed only as a structural reference.

## Patterns adapted

| Reference pattern | NSU Companion adaptation |
| --- | --- |
| Separate service modules and routes | Express route modules for authentication, menus, orders, vendors, users, and administration |
| Searchable service records | Menu search across item names, descriptions, and categories |
| Shared navigation and authenticated actions | React navigation with role-aware customer, vendor, and administrator links |
| Distinct user workflows | Customer ordering, vendor fulfilment, and administrator oversight |
| Availability-oriented listings | Menu availability filtering and clear empty/error states |

## Intentionally not copied

- COVID-19, medicine, plasma, doctor, ICU, hospital, or emergency-service concepts
- Django models, views, templates, URLs, or Python virtual-environment files
- Personal or medical information fields
- Source branding, text, images, database records, or implementation code

## Core domain boundary

Every new feature must directly support campus cafeteria discovery, pre-ordering, payment, fulfilment, or administration. A reference pattern may influence structure or interaction design, but it must be renamed, redesigned, and implemented for the NSU cafeteria domain.

## Review notes

The reference repository demonstrates useful service separation, but it also commits a full virtual environment and contains domain-specific data models. Those parts should not be reproduced. NSU Companion keeps its existing React, Express, and SQLite stack and its original three-role model.
