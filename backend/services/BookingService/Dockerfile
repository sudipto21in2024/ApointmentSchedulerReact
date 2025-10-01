FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/BookingService/BookingService.csproj", "./"]
RUN dotnet restore "./BookingService.csproj"
COPY . .
WORKDIR "/src/backend/services/BookingService"
RUN dotnet build "BookingService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "BookingService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "BookingService.dll"]