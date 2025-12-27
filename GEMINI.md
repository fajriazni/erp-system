<laravel-boost-guidelines>
=== foundation rules ===

# Laravel Boost Guidelines

The Laravel Boost guidelines are specifically curated by Laravel maintainers for this application. These guidelines should be followed closely to enhance the user's satisfaction building Laravel applications.

## Foundational Context
This application is a Laravel application and its main Laravel ecosystems package & versions are below. You are an expert with them all. Ensure you abide by these specific packages & versions.

- php - 8.4.15
- inertiajs/inertia-laravel (INERTIA) - v2
- laravel/fortify (FORTIFY) - v1
- laravel/framework (LARAVEL) - v12
- laravel/prompts (PROMPTS) - v0
- laravel/sanctum (SANCTUM) - v4
- laravel/wayfinder (WAYFINDER) - v0
- laravel/mcp (MCP) - v0
- laravel/pint (PINT) - v1
- laravel/sail (SAIL) - v1
- pestphp/pest (PEST) - v4
- phpunit/phpunit (PHPUNIT) - v12
- @inertiajs/react (INERTIA) - v2
- react (REACT) - v19
- tailwindcss (TAILWINDCSS) - v4
- @laravel/vite-plugin-wayfinder (WAYFINDER) - v0
- eslint (ESLINT) - v9
- prettier (PRETTIER) - v3

## Conventions
- You must follow all existing code conventions used in this application. When creating or editing a file, check sibling files for the correct structure, approach, naming.
- Use descriptive names for variables and methods. For example, `isRegisteredForDiscounts`, not `discount()`.
- Check for existing components to reuse before writing a new one.

## Verification Scripts
- Do not create verification scripts or tinker when tests cover that functionality and prove it works. Unit and feature tests are more important.

## Application Structure & Architecture
- Stick to existing directory structure - don't create new base folders without approval.
- Do not change the application's dependencies without approval.

## Frontend Bundling
- If the user doesn't see a frontend change reflected in the UI, it could mean they need to run `npm run build`, `npm run dev`, or `composer run dev`. Ask them.

## Replies
- Be concise in your explanations - focus on what's important rather than explaining obvious details.

## Documentation Files
- You must only create documentation files if explicitly requested by the user.


=== boost rules ===

## Laravel Boost
- Laravel Boost is an MCP server that comes with powerful tools designed specifically for this application. Use them.

## Artisan
- Use the `list-artisan-commands` tool when you need to call an Artisan command to double check the available parameters.

## URLs
- Whenever you share a project URL with the user you should use the `get-absolute-url` tool to ensure you're using the correct scheme, domain / IP, and port.

## Tinker / Debugging
- You should use the `tinker` tool when you need to execute PHP to debug code or query Eloquent models directly.
- Use the `database-query` tool when you only need to read from the database.

## Reading Browser Logs With the `browser-logs` Tool
- You can read browser logs, errors, and exceptions using the `browser-logs` tool from Boost.
- Only recent browser logs will be useful - ignore old logs.

## Searching Documentation (Critically Important)
- Boost comes with a powerful `search-docs` tool you should use before any other approaches. This tool automatically passes a list of installed packages and their versions to the remote Boost API, so it returns only version-specific documentation specific for the user's circumstance. You should pass an array of packages to filter on if you know you need docs for particular packages.
- The 'search-docs' tool is perfect for all Laravel related packages, including Laravel, Inertia, Livewire, Filament, Tailwind, Pest, Nova, Nightwatch, etc.
- You must use this tool to search for Laravel-ecosystem documentation before falling back to other approaches.
- Search the documentation before making code changes to ensure we are taking the correct approach.
- Use multiple, broad, simple, topic based queries to start. For example: `['rate limiting', 'routing rate limiting', 'routing']`.
- Do not add package names to queries - package information is already shared. For example, use `test resource table`, not `filament 4 test resource table`.

### Available Search Syntax
- You can and should pass multiple queries at once. The most relevant results will be returned first.

1. Simple Word Searches with auto-stemming - query=authentication - finds 'authenticate' and 'auth'
2. Multiple Words (AND Logic) - query=rate limit - finds knowledge containing both "rate" AND "limit"
3. Quoted Phrases (Exact Position) - query="infinite scroll" - Words must be adjacent and in that order
4. Mixed Queries - query=middleware "rate limit" - "middleware" AND exact phrase "rate limit"
5. Multiple Queries - queries=["authentication", "middleware"] - ANY of these terms


=== php rules ===

## PHP

- Always use curly braces for control structures, even if it has one line.

### Constructors
- Use PHP 8 constructor property promotion in `__construct()`.
    - <code-snippet>public function __construct(public GitHub $github) { }</code-snippet>
- Do not allow empty `__construct()` methods with zero parameters.

### Type Declarations
- Always use explicit return type declarations for methods and functions.
- Use appropriate PHP type hints for method parameters.

<code-snippet name="Explicit Return Types and Method Params" lang="php">
protected function isAccessible(User $user, ?string $path = null): bool
{
    ...
}
</code-snippet>

## Comments
- Prefer PHPDoc blocks over comments. Never use comments within the code itself unless there is something _very_ complex going on.

## PHPDoc Blocks
- Add useful array shape type definitions for arrays when appropriate.

## Enums
- Typically, keys in an Enum should be TitleCase. For example: `FavoritePerson`, `BestLake`, `Monthly`.


=== tests rules ===

## Test Enforcement

- Every change must be programmatically tested. Write a new test or update an existing test, then run the affected tests to make sure they pass.
- Run the minimum number of tests needed to ensure code quality and speed. Use `php artisan test` with a specific filename or filter.


=== inertia-laravel/core rules ===

## Inertia Core

- Inertia.js components should be placed in the `resources/js/Pages` directory unless specified differently in the JS bundler (vite.config.js).
- Use `Inertia::render()` for server-side routing instead of traditional Blade views.
- Use `search-docs` for accurate guidance on all things Inertia.

<code-snippet lang="php" name="Inertia::render Example">
// routes/web.php example
Route::get('/users', function () {
    return Inertia::render('Users/Index', [
        'users' => User::all()
    ]);
});
</code-snippet>


=== inertia-laravel/v2 rules ===

## Inertia v2

- Make use of all Inertia features from v1 & v2. Check the documentation before making any changes to ensure we are taking the correct approach.

### Inertia v2 New Features
- Polling
- Prefetching
- Deferred props
- Infinite scrolling using merging props and `WhenVisible`
- Lazy loading data on scroll

### Deferred Props & Empty States
- When using deferred props on the frontend, you should add a nice empty state with pulsing / animated skeleton.

### Inertia Form General Guidance
- The recommended way to build forms when using Inertia is with the `<Form>` component - a useful example is below. Use `search-docs` with a query of `form component` for guidance.
- Forms can also be built using the `useForm` helper for more programmatic control, or to follow existing conventions. Use `search-docs` with a query of `useForm helper` for guidance.
- `resetOnError`, `resetOnSuccess`, and `setDefaultsOnSuccess` are available on the `<Form>` component. Use `search-docs` with a query of 'form component resetting' for guidance.


=== laravel/core rules ===

## Do Things the Laravel Way

- Use `php artisan make:` commands to create new files (i.e. migrations, controllers, models, etc.). You can list available Artisan commands using the `list-artisan-commands` tool.
- If you're creating a generic PHP class, use `php artisan make:class`.
- Pass `--no-interaction` to all Artisan commands to ensure they work without user input. You should also pass the correct `--options` to ensure correct behavior.

### Database
- Always use proper Eloquent relationship methods with return type hints. Prefer relationship methods over raw queries or manual joins.
- Use Eloquent models and relationships before suggesting raw database queries
- Avoid `DB::`; prefer `Model::query()`. Generate code that leverages Laravel's ORM capabilities rather than bypassing them.
- Generate code that prevents N+1 query problems by using eager loading.
- Use Laravel's query builder for very complex database operations.

### Model Creation
- When creating new models, create useful factories and seeders for them too. Ask the user if they need any other things, using `list-artisan-commands` to check the available options to `php artisan make:model`.

### APIs & Eloquent Resources
- For APIs, default to using Eloquent API Resources and API versioning unless existing API routes do not, then you should follow existing application convention.

### Controllers & Validation
- Always create Form Request classes for validation rather than inline validation in controllers. Include both validation rules and custom error messages.
- Check sibling Form Requests to see if the application uses array or string based validation rules.

### Queues
- Use queued jobs for time-consuming operations with the `ShouldQueue` interface.

### Authentication & Authorization
- Use Laravel's built-in authentication and authorization features (gates, policies, Sanctum, etc.).

### URL Generation
- When generating links to other pages, prefer named routes and the `route()` function.

### Configuration
- Use environment variables only in configuration files - never use the `env()` function directly outside of config files. Always use `config('app.name')`, not `env('APP_NAME')`.

### Testing
- When creating models for tests, use the factories for the models. Check if the factory has custom states that can be used before manually setting up the model.
- Faker: Use methods such as `$this->faker->word()` or `fake()->randomDigit()`. Follow existing conventions whether to use `$this->faker` or `fake()`.
- When creating tests, make use of `php artisan make:test [options] {name}` to create a feature test, and pass `--unit` to create a unit test. Most tests should be feature tests.

### Vite Error
- If you receive an "Illuminate\Foundation\ViteException: Unable to locate file in Vite manifest" error, you can run `npm run build` or ask the user to run `npm run dev` or `composer run dev`.


=== laravel/v12 rules ===

## Laravel 12

- Use the `search-docs` tool to get version specific documentation.
- Since Laravel 11, Laravel has a new streamlined file structure which this project uses.

### Laravel 12 Structure
- No middleware files in `app/Http/Middleware/`.
- `bootstrap/app.php` is the file to register middleware, exceptions, and routing files.
- `bootstrap/providers.php` contains application specific service providers.
- **No app\Console\Kernel.php** - use `bootstrap/app.php` or `routes/console.php` for console configuration.
- **Commands auto-register** - files in `app/Console/Commands/` are automatically available and do not require manual registration.

### Database
- When modifying a column, the migration must include all of the attributes that were previously defined on the column. Otherwise, they will be dropped and lost.
- Laravel 11 allows limiting eagerly loaded records natively, without external packages: `$query->latest()->limit(10);`.

### Models
- Casts can and likely should be set in a `casts()` method on a model rather than the `$casts` property. Follow existing conventions from other models.


=== wayfinder/core rules ===

## Laravel Wayfinder

Wayfinder generates TypeScript functions and types for Laravel controllers and routes which you can import into your client side code. It provides type safety and automatic synchronization between backend routes and frontend code.

### Development Guidelines
- Always use `search-docs` to check wayfinder correct usage before implementing any features.
- Always Prefer named imports for tree-shaking (e.g., `import { show } from '@/actions/...'`)
- Avoid default controller imports (prevents tree-shaking)
- Run `php artisan wayfinder:generate` after route changes if Vite plugin isn't installed

### Feature Overview
- Form Support: Use `.form()` with `--with-form` flag for HTML form attributes — `<form {...store.form()}>` → `action="/posts" method="post"`
- HTTP Methods: Call `.get()`, `.post()`, `.patch()`, `.put()`, `.delete()` for specific methods — `show.head(1)` → `{ url: "/posts/1", method: "head" }`
- Invokable Controllers: Import and invoke directly as functions. For example, `import StorePost from '@/actions/.../StorePostController'; StorePost()`
- Named Routes: Import from `@/routes/` for non-controller routes. For example, `import { show } from '@/routes/post'; show(1)` for route name `post.show`
- Parameter Binding: Detects route keys (e.g., `{post:slug}`) and accepts matching object properties — `show("my-post")` or `show({ slug: "my-post" })`
- Query Merging: Use `mergeQuery` to merge with `window.location.search`, set values to `null` to remove — `show(1, { mergeQuery: { page: 2, sort: null } })`
- Query Parameters: Pass `{ query: {...} }` in options to append params — `show(1, { query: { page: 1 } })` → `"/posts/1?page=1"`
- Route Objects: Functions return `{ url, method }` shaped objects — `show(1)` → `{ url: "/posts/1", method: "get" }`
- URL Extraction: Use `.url()` to get URL string — `show.url(1)` → `"/posts/1"`

### Example Usage

<code-snippet name="Wayfinder Basic Usage" lang="typescript">
    // Import controller methods (tree-shakable)
    import { show, store, update } from '@/actions/App/Http/Controllers/PostController'

    // Get route object with URL and method...
    show(1) // { url: "/posts/1", method: "get" }

    // Get just the URL...
    show.url(1) // "/posts/1"

    // Use specific HTTP methods...
    show.get(1) // { url: "/posts/1", method: "get" }
    show.head(1) // { url: "/posts/1", method: "head" }

    // Import named routes...
    import { show as postShow } from '@/routes/post' // For route name 'post.show'
    postShow(1) // { url: "/posts/1", method: "get" }
</code-snippet>


### Wayfinder + Inertia
If your application uses the `<Form>` component from Inertia, you can use Wayfinder to generate form action and method automatically.
<code-snippet name="Wayfinder Form Component (React)" lang="typescript">

<Form {...store.form()}><input name="title" /></Form>

</code-snippet>


=== pint/core rules ===

## Laravel Pint Code Formatter

- You must run `vendor/bin/pint --dirty` before finalizing changes to ensure your code matches the project's expected style.
- Do not run `vendor/bin/pint --test`, simply run `vendor/bin/pint` to fix any formatting issues.


=== pest/core rules ===

## Pest
### Testing
- If you need to verify a feature is working, write or update a Unit / Feature test.

### Pest Tests
- All tests must be written using Pest. Use `php artisan make:test --pest {name}`.
- You must not remove any tests or test files from the tests directory without approval. These are not temporary or helper files - these are core to the application.
- Tests should test all of the happy paths, failure paths, and weird paths.
- Tests live in the `tests/Feature` and `tests/Unit` directories.
- Pest tests look and behave like this:
<code-snippet name="Basic Pest Test Example" lang="php">
it('is true', function () {
    expect(true)->toBeTrue();
});
</code-snippet>

### Running Tests
- Run the minimal number of tests using an appropriate filter before finalizing code edits.
- To run all tests: `php artisan test`.
- To run all tests in a file: `php artisan test tests/Feature/ExampleTest.php`.
- To filter on a particular test name: `php artisan test --filter=testName` (recommended after making a change to a related file).
- When the tests relating to your changes are passing, ask the user if they would like to run the entire test suite to ensure everything is still passing.

### Pest Assertions
- When asserting status codes on a response, use the specific method like `assertForbidden` and `assertNotFound` instead of using `assertStatus(403)` or similar, e.g.:
<code-snippet name="Pest Example Asserting postJson Response" lang="php">
it('returns all', function () {
    $response = $this->postJson('/api/docs', []);

    $response->assertSuccessful();
});
</code-snippet>

### Mocking
- Mocking can be very helpful when appropriate.
- When mocking, you can use the `Pest\Laravel\mock` Pest function, but always import it via `use function Pest\Laravel\mock;` before using it. Alternatively, you can use `$this->mock()` if existing tests do.
- You can also create partial mocks using the same import or self method.

### Datasets
- Use datasets in Pest to simplify tests which have a lot of duplicated data. This is often the case when testing validation rules, so consider going with this solution when writing tests for validation rules.

<code-snippet name="Pest Dataset Example" lang="php">
it('has emails', function (string $email) {
    expect($email)->not->toBeEmpty();
})->with([
    'james' => 'james@laravel.com',
    'taylor' => 'taylor@laravel.com',
]);
</code-snippet>


=== pest/v4 rules ===

## Pest 4

- Pest v4 is a huge upgrade to Pest and offers: browser testing, smoke testing, visual regression testing, test sharding, and faster type coverage.
- Browser testing is incredibly powerful and useful for this project.
- Browser tests should live in `tests/Browser/`.
- Use the `search-docs` tool for detailed guidance on utilizing these features.

### Browser Testing
- You can use Laravel features like `Event::fake()`, `assertAuthenticated()`, and model factories within Pest v4 browser tests, as well as `RefreshDatabase` (when needed) to ensure a clean state for each test.
- Interact with the page (click, type, scroll, select, submit, drag-and-drop, touch gestures, etc.) when appropriate to complete the test.
- If requested, test on multiple browsers (Chrome, Firefox, Safari).
- If requested, test on different devices and viewports (like iPhone 14 Pro, tablets, or custom breakpoints).
- Switch color schemes (light/dark mode) when appropriate.
- Take screenshots or pause tests for debugging when appropriate.

### Example Tests

<code-snippet name="Pest Browser Test Example" lang="php">
it('may reset the password', function () {
    Notification::fake();

    $this->actingAs(User::factory()->create());

    $page = visit('/sign-in'); // Visit on a real browser...

    $page->assertSee('Sign In')
        ->assertNoJavascriptErrors() // or ->assertNoConsoleLogs()
        ->click('Forgot Password?')
        ->fill('email', 'nuno@laravel.com')
        ->click('Send Reset Link')
        ->assertSee('We have emailed your password reset link!')

    Notification::assertSent(ResetPassword::class);
});
</code-snippet>

<code-snippet name="Pest Smoke Testing Example" lang="php">
$pages = visit(['/', '/about', '/contact']);

$pages->assertNoJavascriptErrors()->assertNoConsoleLogs();
</code-snippet>


=== inertia-react/core rules ===

## Inertia + React

- Use `router.visit()` or `<Link>` for navigation instead of traditional links.

<code-snippet name="Inertia Client Navigation" lang="react">

import { Link } from '@inertiajs/react'
<Link href="/">Home</Link>

</code-snippet>


=== inertia-react/v2/forms rules ===

## Inertia + React Forms

<code-snippet name="`<Form>` Component Example" lang="react">

import { Form } from '@inertiajs/react'

export default () => (
    <Form action="/users" method="post">
        {({
            errors,
            hasErrors,
            processing,
            wasSuccessful,
            recentlySuccessful,
            clearErrors,
            resetAndClearErrors,
            defaults
        }) => (
        <>
        <input type="text" name="name" />

        {errors.name && <div>{errors.name}</div>}

        <button type="submit" disabled={processing}>
            {processing ? 'Creating...' : 'Create User'}
        </button>

        {wasSuccessful && <div>User created successfully!</div>}
        </>
    )}
    </Form>
)

</code-snippet>


=== tailwindcss/core rules ===

## Tailwind Core

- Use Tailwind CSS classes to style HTML, check and use existing tailwind conventions within the project before writing your own.
- Offer to extract repeated patterns into components that match the project's conventions (i.e. Blade, JSX, Vue, etc..)
- Think through class placement, order, priority, and defaults - remove redundant classes, add classes to parent or child carefully to limit repetition, group elements logically
- You can use the `search-docs` tool to get exact examples from the official documentation when needed.

### Spacing
- When listing items, use gap utilities for spacing, don't use margins.

    <code-snippet name="Valid Flex Gap Spacing Example" lang="html">
        <div class="flex gap-8">
            <div>Superior</div>
            <div>Michigan</div>
            <div>Erie</div>
        </div>
    </code-snippet>


### Dark Mode
- If existing pages and components support dark mode, new pages and components must support dark mode in a similar way, typically using `dark:`.


=== tailwindcss/v4 rules ===

## Tailwind 4

- Always use Tailwind CSS v4 - do not use the deprecated utilities.
- `corePlugins` is not supported in Tailwind v4.
- In Tailwind v4, configuration is CSS-first using the `@theme` directive — no separate `tailwind.config.js` file is needed.
<code-snippet name="Extending Theme in CSS" lang="css">
@theme {
  --color-brand: oklch(0.72 0.11 178);
}
</code-snippet>

- In Tailwind v4, you import Tailwind using a regular CSS `@import` statement, not using the `@tailwind` directives used in v3:

<code-snippet name="Tailwind v4 Import Tailwind Diff" lang="diff">
   - @tailwind base;
   - @tailwind components;
   - @tailwind utilities;
   + @import "tailwindcss";
</code-snippet>


### Replaced Utilities
- Tailwind v4 removed deprecated utilities. Do not use the deprecated option - use the replacement.
- Opacity values are still numeric.

| Deprecated |	Replacement |
|------------+--------------|
| bg-opacity-* | bg-black/* |
| text-opacity-* | text-black/* |
| border-opacity-* | border-black/* |
| divide-opacity-* | divide-black/* |
| ring-opacity-* | ring-black/* |
| placeholder-opacity-* | placeholder-black/* |
| flex-shrink-* | shrink-* |
| flex-grow-* | grow-* |
| overflow-ellipsis | text-ellipsis |
| decoration-slice | box-decoration-slice |
| decoration-clone | box-decoration-clone |


=== laravel/fortify rules ===

## Laravel Fortify

Fortify is a headless authentication backend that provides authentication routes and controllers for Laravel applications.

**Before implementing any authentication features, use the `search-docs` tool to get the latest docs for that specific feature.**

### Configuration & Setup
- Check `config/fortify.php` to see what's enabled. Use `search-docs` for detailed information on specific features.
- Enable features by adding them to the `'features' => []` array: `Features::registration()`, `Features::resetPasswords()`, etc.
- To see the all Fortify registered routes, use the `list-routes` tool with the `only_vendor: true` and `action: "Fortify"` parameters.
- Fortify includes view routes by default (login, register). Set `'views' => false` in the configuration file to disable them if you're handling views yourself.

### Customization
- Views can be customized in `FortifyServiceProvider`'s `boot()` method using `Fortify::loginView()`, `Fortify::registerView()`, etc.
- Customize authentication logic with `Fortify::authenticateUsing()` for custom user retrieval / validation.
- Actions in `app/Actions/Fortify/` handle business logic (user creation, password reset, etc.). They're fully customizable, so you can modify them to change feature behavior.

## Available Features
- `Features::registration()` for user registration.
- `Features::emailVerification()` to verify new user emails.
- `Features::twoFactorAuthentication()` for 2FA with QR codes and recovery codes.
  - Add options: `['confirmPassword' => true, 'confirm' => true]` to require password confirmation and OTP confirmation before enabling 2FA.
- `Features::updateProfileInformation()` to let users update their profile.
- `Features::updatePasswords()` to let users change their passwords.
- `Features::resetPasswords()` for password reset via email.
</laravel-boost-guidelines>
# Project Architecture Knowledge Base

## 🏗️ Architectural Overview
**Style**: Modular Monolith with Domain-Driven Design (DDD) principles.
**Framework**: Laravel 12 (Backend) + Inertia.js / React (Frontend).
**State**: Hybird of vertical slice modules and shared infrastructure.

---

## 🧩 Module Structure
The application is organized into distinct business domains located in `app/Domain`.

### 1. Core Modules (Business Logic)
| UI Module | Backend Domain | Description |
| :--- | :--- | :--- |
| **Accounting** | `app/Domain/Finance` | General Ledger, COA, Journals |
| **Finance** | `app/Domain/Finance` | Cash Management, AR/AP, Banking |
| **Purchasing** | `app/Domain/Purchasing` | procurement, RFQs, POs, Vendors |
| **Sales** | `app/Domain/Sales` | Orders, Invoices, Customers |
| **Inventory** | `app/Domain/Inventory` | Stock, Warehouses (Assumed) |

### 2. Operations & Assets
| UI Module | Backend Domain | Description |
| :--- | :--- | :--- |
| **Assets** | `app/Domain/Assets` | Fixed Asset Management |
| **Projects** | `app/Domain/` (TBD) | *Domain folder not yet verified* |
| **Manufacturing** | `app/Domain/` (TBD) | *Domain folder not yet verified* |

### 3. Support & Infrastructure
| UI Module | Backend Domain | Description |
| :--- | :--- | :--- |
| **Workflows** | `app/Domain/Workflow` | Approval chains, BP automation |
| **Approval** | `app/Domain/Approval` | Generic approval logic |

### Directory Pattern
Each module in `app/Domain` typically follows this structure:
```text
app/Domain/{DomainName}/
├── Actions/        # Single-responsibility actions
├── Contracts/      # Interfaces (Repositories, Services)
├── DataTransferObjects/ # DTOs
├── Enums/          # Domain-specific Enums
├── Events/         # Domain Events
├── Listeners/      # Event Listeners
├── Models/         # (Optional) Domain-specific models if strictly separated
├── Repositories/   # Repository Implementations
├── Services/       # Domain Services (Business Logic)
└── ValueObjects/   # Immutable value objects
```

---

## 🛠️ Infrastructure & Application Layer

### HTTP Layer (`app/Http`)
- **Controllers**: Organized by Module (`app/Http/Controllers/{Module}`).
- **Requests**: Form Requests for validation (`app/Http/Requests/{Module}`).
- **Resources**: API Resources for JSON responses.
- **Middleware**: Application-wide and route-specific middleware.

### Database
- **Migrations**: Standard Laravel migrations.
- **Seeds**: Database seeders for initial state.
- **Models**: Eloquent models located in `app/Models`.
  - *Note*: Models are currently centralized in `app/Models`, but logically belong to domains.

### Routing
- **Web Routes**: `routes/web.php` (Main entry)
- **Dedicated Routes**: `routes/accounting.php`, `routes/purchasing.php` (included in web.php)
- **Wayfinder**: Used for type-safe route generation for frontend.

---

## 💻 Frontend Architecture

### Stack
- **Library**: React 19 + TypeScript
- **Glue**: Inertia.js v2
- **Styling**: Tailwind CSS v4 + Shadcn UI
- **Build Tool**: Vite

### Directory Structure (`resources/js`)
```text
resources/js/
├── actions/        # Wayfinder generated route actions
├── components/     # Reusable UI components (Shadcn)
│   └── ui/         # Base UI primitives
├── layouts/        # Page layouts (AppLayout, GuestLayout)
├── pages/          # Inertia Pages (Map to Controllers)
│   ├── Accounting/
│   ├── Purchasing/
│   └── ...
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

### Key Libraries
- **Wayfinder**: For route handling (`@/actions/...`).
- **Lucide React**: Icon set.
- **TanStack Table**: (Likely used for DataTables).
- **Zod**: (Likely used for schema validation if complex).

---

## 📏 Development Conventions

### Domain-Driven Design (DDD) rules
1.  **Services**: Encapsulate business logic. Controllers should be thin and delegate to Services.
2.  **Repositories**: Abstract data access. Controllers inject Repository Interfaces.
3.  **Events**: Use Domain Events for side effects and loose coupling (e.g., `ChartOfAccountCreated`).
4.  **Value Objects**: Use for complex attributes (e.g., `Money`, `AccountCode`).

### Code Style
- **Formatting**: Laravel Pint (PHP), Prettier (JS/TS).
- **Type Safety**:
  - PHP: Strict types `declare(strict_types=1);`, Return type hints.
  - TS: strict mode, interfaces for Props and Models.

### Routing
- **Backend**: Use `routes/{module}.php` for organization.
- **Frontend**: **ALWAYS** use Wayfinder generated actions (`import * as Module from '@/actions/...'`). Avoid hardcoded strings.

### Testing
- **Framework**: Pest PHP v4.
- **Types**:
  - `Feature`: HTTP tests (Controllers, End-to-end flows).
  - `Unit`: Domain logic tests (Services, Value Objects).
  - `Browser`: **Pest 4 Browser Testing** (via `pestphp/pest-plugin-browser`).

---

## 🚀 Antigravity Integration Ideas
*Insights for AI Agent interaction*
1.  **Context Awareness**: When asked about "Accounting", refer to `app/Domain/Finance` and `app/Http/Controllers/Accounting`.
2.  **Code Generation**:
    - When creating a new feature, prompt for: Service, Controller, Request, Route, and Page.
    - Always generate Wayfinder types after route changes (`php artisan wayfinder:generate`).
3.  **Refactoring**: Look for "Fat Controllers" and suggest moving logic to Domain Services.


# --- DETAILED DOMAIN KNOWLEDGE ITEMS ---

# Knowledge Item: Purchasing Domain Architecture

## 🎯 Domain Scope
The Purchasing domain (`app/Domain/Purchasing`) handles the end-to-end procurement process, from sourcing and vendor management to purchase order fulfillment and receiving.

---

## 🏗️ Core Entities & Relationships
1. **Vendor**: Central registry for suppliers.
   - *Onboarding*: Specialized workflow for qualifying new vendors.
2. **Purchase Requisition (PR)**: Internal requests for goods/services.
3. **RFQ (Request for Quotation)**: Sourcing process to invite vendor bids.
4. **Purchase Agreement (PA)**: Master contracts with vendors.
5. **Blanket Order (BPO)**: Continuous orders with quota management.
6. **Purchase Order (PO)**: The final commitment to buy.
7. **Goods Receipt (GR)**: Verification of received items.

---

## 🔄 Blanket Order (BPO) Lifecycle
BPOs are "living" contracts that are realized over time through "Call-offs".

### Status Transitions:
- **Drafting**: Initial creation.
- **Approval**: Pending managerial sign-off.
- **Call-offs (Active)**: Open for realization. POs are created against this BPO.
- **Monitoring**: Active tracking of quotas.
- **Fulfilled**: All quantities/amounts delivered.
- **Depleted**: Quota exhausted but not necessarily fully delivered.
- **Closed**: Manual or automatic termination of the agreement.

### Quota Logic:
- Each BPO has a `total_quota`.
- `realized_amount` is updated whenever a related PO is `confirmed` or `received`.
- Prevents over-ordering beyond the contract limit.

---

## 📑 RFQ & Tendering Process
- **Draft**: Preparing requirements.
- **Open**: Invitations sent to vendors.
- **Comparison**: Analyzing bids side-by-side.
- **Awarded**: Vendor(s) selected; transitions to PO or Agreement.

---

## 📏 Business Rules
1. **Three-Way Match**: Verification between PO, Goods Receipt, and Vendor Invoice before payment.
2. **Vendor Qualification**: Vendors must pass onboarding/audits before they can be invited to RFQs.
3. **Approval Chains**: Transactions above certain thresholds require multi-level approval via the `Workflow` domain.

---

## 🛠️ Technical Implementation
- **Services**: All creation/status transitions are handled in `app/Domain/Purchasing/Services`.
- **Events**: Dispatches events like `BlanketOrderFulfilled` to trigger downstream notifications or status updates.
- **Value Objects**: Uses `Money` and `Quantity` for precise calculations.


---

# Knowledge Item: Finance & Accounting Domain Architecture

## 🎯 Domain Scope
The Finance domain (`app/Domain/Finance`) manages the financial integrity of the ERP system, centered around a Double-Entry Bookkeeping system and the General Ledger.

---

## 🏗️ Core Entities
1. **Chart of Accounts (COA)**: The backbone of the system.
   - *Hierarchy*: Supports parent-child relationships (e.g., "Cash" parent of "Petty Cash").
   - *Types*: Asset, Liability, Equity, Revenue, Expense.
2. **Journal Entry**: Individual accounting transactions.
3. **Journal Entry Line**: The specific debits and credits within an entry.
4. **Financial Period**: Defines open/closed periods for accounting.

---

## ⚖️ Double-Entry Principles
The system strictly enforces the accounting equation: `Assets = Liabilities + Equity`.

### Validation Rules:
- **Balanced Check**: A Journal Entry must have `Total Debits = Total Credits`.
- **Status Control**: Only `posted` entries affect account balances. `draft` entries are for preparation.
- **Integrity**: Deleting an account is forbidden if it has transactions (Journal Entry Lines).

---

## 🌳 COA Hierarchy & Roll-up
- Balances are often viewed at the "Summary" level.
- **Leaf Accounts**: Accounts without children where transactions are actually posted.
- **Group Accounts**: Summary accounts that aggregate balances from their children for reporting.

---

## 🔄 Journal Entry Lifecycle
1. **Draft**: Entry is being prepared.
2. **Review**: (Optional) Pending approval if threshold met.
3. **Posted**: Transaction is finalized and reflected in the Ledger.
4. **Reversed**: To correct errors, a new reversing entry is created; the original remains for audit.

---

## 📊 Reporting Architecture
Reports are generated by querying `journal_entry_lines` and grouping by `chart_of_account_id`.
- **Trial Balance**: Sum of debits and credits for all accounts.
- **Balance Sheet**: Snapshot of Assets, Liabilities, and Equity.
- **Profit & Loss**: Aggregate of Revenue and Expenses over a period.

---

## 📏 Development Guidelines
1. **Immutability**: Once a Journal Entry is `posted`, it cannot be modified. It must be reversed.
2. **Strict Typing**: Use the `AccountCode` value object to ensure consistent COA formatting (e.g., `1110-001`).
3. **Lazy Loading**: Avoid N+1 issues by eager-loading `children` and `parent` for COA tree views.


---

# Knowledge Item: Workflow & Approvals Architecture

## 🎯 Domain Scope
The Workflow domain (`app/Domain/Workflow`) provides a generic framework for automating business processes and approval chains across all ERP modules.

---

## 🏗️ Core Entities
1. **Workflow**: The master definition for a process (e.g., "Purchase Order Approval").
2. **WorkflowStep**: A single level in the approval chain.
   - *Approvers*: Can be specific users, roles, or dynamic roles (e.g., "Department Head").
3. **WorkflowCondition**: Logical rules that determine if a step is triggered (e.g., "Amount > $10,000").
4. **WorkflowInstance**: The actual execution of a workflow for a specific record.
5. **WorkflowLog**: The audit trail of approvals, rejections, and comments.

---

## 🔄 Lifecycle of an Approval
1. **Trigger**: A transaction (e.g., PO) is "Submitted for Review".
2. **Initialization**: The system finds the matching Workflow definition and creates a `WorkflowInstance`.
3. **Queueing**: The current `WorkflowStep` is identified, and notifications are sent to approvers.
4. **Action**: 
   - **Approve**: Move to the next step.
   - **Reject**: Transition the transaction to `rejected` status.
   - **Request Changes**: Move back to `draft`.
5. **Completion**: All steps approved; transaction transitions to `confirmed` or `open`.

---

## 📏 Business Rules
1. **Sequential vs Parallel**: Steps can be configured to require one or all approvers to sign off.
2. **Dynamic Conditions**: Supports complex logic like multi-currency conversion for threshold checks.
3. **Delegation**: Approvers can delegate their authority to others during leave (Assumed/Future).

---

## 🛠️ Integration Pattern
Transacting models (like `PurchaseOrder`) use a trait or contract to link with `WorkflowInstance`.
- The `WorkflowService` acts as the orchestrator.
- Dispatches `WorkflowStepApproved` events to update original model statuses.

---

## 💻 Frontend Builder
- **ConditionBuilder**: Specialized component in `resources/js/pages/Workflow` for visual logic construction.
- **WorkflowPreview**: Visualization of the approval flow (Sequential/Branching).
