# Sprendžiamo uždavinio aprašymas
## 1.1.	Sistemos paskirtis
**Projekto tikslas** – sukurti sistemą, kuri palengvintų pradžios mentorystės administravimą.

Veikimo principas sudarytas iš trijų dalių:
-	Internetinė svetainė, kuria naudosis mentoriai, fakultetų koordinatoriai bei sistemos administratorius;
-	Aplikacijų programavimo sąsaja;
-	Duomenų bazė, kurioje bus saugomi  naudotojų duomenys.

## 1.2.	Funkciniai reikalavimai
**Mentorius galės:**
-	Prisijungti prie internetinės svetainės;
-	Atsijungti nuo internetinės svetainės;
-	Valdyti grupes:
    - Pridėti grupę;
    - Pašalinti grupę;
    - Redaguoti grupės informaciją;
    - Peržiūrėti grupę;
    - Peržiūrėti visų grupių sąrašą.

**Fakulteto koordinatorius galės:**
-	Prisijungti prie internetinės svetainės;
-	Atsijungti nuo internetinės svetainės;
-	Valdyti mentorius:
    -	Pridėti mentorių;
    -	Pašalinti mentorių;
    -	Redaguoti mentoriaus informaciją;
    -	Peržiūrėti mentoriaus informaciją;
    -	Peržiūrėti visų mentorių sąrašą.

**Sistemos administratorius galės:**
-	Prisijungti prie internetinės svetainės;
-	Atsijungti nuo internetinės svetainės;
-	Peržiūrėti visus konkretaus fakulteto mentorius;
-	Valdyti fakultetus:
    -	Pridėti fakultetą;
    -	Pašalinti fakultetą;
    -	Redaguoti fakulteto informaciją;
    -	Peržiūrėti konkretų fakultetą;
    -	Peržiūrėti visų fakultetų sąrašą.
 
# 2.	Pasirinktų technologijų aprašymas
**Sistemos sudedamosios dalys:**
-	Kliento pusė: naudojama React.js;
-	Serverio pusė: naudojama .NET Framework ir EntityFramework biblioteka;
-	Duomenų bazė: naudojama MySQL.

Sistemos talpinimui naudojamas „Azure“ serveris. Klientinė dalis valdoma per HTTP protokolą. Sistemos veikimui naudojama .NET aplinka su „Entity Framework“, kuri pasiekiamas per API (aplikacijų programavimo sąsają). Naudojant ORM sąsają vykdomi duomenų mainai tarp .NET + „Entity Framework“ ir MySQL Server (duomenų bazės).
