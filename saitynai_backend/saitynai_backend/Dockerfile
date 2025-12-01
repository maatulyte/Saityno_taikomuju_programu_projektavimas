# --- Build stage ---
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# copy csproj and restore
COPY saitynai_backend.csproj ./
RUN dotnet restore "saitynai_backend.csproj"

# copy all and build
COPY . .
RUN dotnet publish "saitynai_backend.csproj" -c Release -o /app/publish /p:UseAppHost=false

# --- Runtime stage ---
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# App will listen on port 8080 (what DO expects)
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "saitynai_backend.dll"]